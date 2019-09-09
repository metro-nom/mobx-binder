import moment from 'moment'
import { BinderValidationResult, Converter, ValidationError } from 'mobx-binder'

export class MomentConverter implements Converter<BinderValidationResult, string, moment.Moment> {

    constructor(private format: string, private errorMessage = 'conversions.error.moment') {
    }

    public convertToModel(value?: string): moment.Moment | undefined {
        if (!!value) {
            const result = moment(value, this.format, true)
            if (!result.isValid()) {
                throw new ValidationError({ messageKey: this.errorMessage, args: { value } })
            }
            return result
        }
        return undefined
    }

    public convertToPresentation(data?: moment.Moment): string {
        return data ? data.format(this.format) : ''
    }

    public isEqual(first: moment.Moment, second: moment.Moment) {
        return first.isSame(second)
    }
}
