import dayjs, { Dayjs } from 'dayjs'
import { BinderValidationResult, Converter, ValidationError, createLabel } from 'mobx-binder'

export class DayjsConverter implements Converter<BinderValidationResult, string | undefined, Dayjs | undefined> {
    readonly label: string

    constructor(
        private formats: string | string[],
        private locale: string | undefined = undefined,
        private strict = false,
        private errorMessage = 'conversions.error.dayjs',
    ) {
        this.label = createLabel('MomentConverter', { formats: JSON.stringify(formats), locale, strict })
    }

    private get primaryFormat() {
        const formats = this.formats
        return typeof formats === 'string' ? formats : formats[0]
    }

    private isNotEmpty(value: string) {
        const valueWithoutSpace = value.replace(/ /g, '');
        return valueWithoutSpace.length > 2
    }

    public convertToModel(value?: string): Dayjs | undefined {
        if (!!value && this.isNotEmpty(value)) {
            const result = this.locale ? dayjs(value, this.formats, this.locale, this.strict) : dayjs(value, this.formats, this.strict)
            if (!result.isValid()) {
                throw new ValidationError({ messageKey: this.errorMessage, args: { value } })
            }
            return result
        }
        return undefined
    }

    public convertToPresentation(data?: Dayjs): string {
        return data ? data.format(this.primaryFormat) : ''
    }

    public isEqual(first: Dayjs, second: Dayjs) {
        return first.isSame(second)
    }
}
