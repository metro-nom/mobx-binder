import * as moment from 'moment'
import { BinderValidationResult } from '../model/DefaultBinder'
import { Converter, ValidationError } from 'mobx-binder-core'

export class MomentConverter implements Converter<BinderValidationResult, string, moment.Moment> {

    constructor(private format: string, private errorMessage = 'conversions.error.moment') {
    }

    public convertToModel(value: string): moment.Moment | undefined {
        if (value === '') {
            return undefined
        } else {
            const result = moment(value, this.format, true)
            if (!result.isValid()) {
                throw new ValidationError({ messageKey: this.errorMessage, args: { value } })
            }
            return result
        }
    }

    public convertToPresentation(data?: moment.Moment): string {
        return data ? data.format(this.format) : ''
    }
}
