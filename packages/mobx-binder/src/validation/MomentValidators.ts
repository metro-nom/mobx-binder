import * as moment from 'moment'
import { BinderValidationResult, BinderValidator, DefaultContext } from '../model/DefaultBinder'

export class MomentValidators {
    public static dayInFuture(messageKey = 'validations.dayInFuture'): BinderValidator<moment.Moment> {
        return (value) => MomentValidators.validate(moment.isMoment(value) && value.diff(moment(), 'days') <= 0, messageKey, { value })
    }

    public static todayOrInFuture(messageKey = 'validations.todayOrInFuture'): BinderValidator<moment.Moment> {
        return (value) => MomentValidators.validate(moment.isMoment(value) && value.diff(moment(), 'days') < 0, messageKey, { value })
    }

    public static dayInPast(messageKey = 'validations.dayInPast'): BinderValidator<moment.Moment> {
        return (value) => MomentValidators.validate(moment.isMoment(value) && value.diff(moment(), 'days') >= 0, messageKey, { value })
    }

    public static todayOrInPast(messageKey = 'validations.todayOrInPast'): BinderValidator<moment.Moment> {
        return (value) => MomentValidators.validate(moment.isMoment(value) && value.diff(moment(), 'days') > 0, messageKey, { value })
    }

    private static validate(errorCondition: boolean, message: string, args?: any): BinderValidationResult {
        return errorCondition ? { messageKey: message, args } : {}
    }
}
