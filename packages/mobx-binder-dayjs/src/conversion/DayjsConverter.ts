import dayjs, { Dayjs } from 'dayjs'
import { BinderValidationResult, Converter, ValidationError } from 'mobx-binder'

export class DayjsConverter implements Converter<BinderValidationResult, string | undefined, Dayjs | undefined> {
    constructor(private formats: string | string[], private locale = undefined, private strict = false, private errorMessage = 'conversions.error.dayjs') {}

    private get primaryFormat() {
        const formats = this.formats
        return typeof formats === 'string' ? formats : formats[0]
    }

    public convertToModel(value?: string): Dayjs | undefined {
        if (!!value) {
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
