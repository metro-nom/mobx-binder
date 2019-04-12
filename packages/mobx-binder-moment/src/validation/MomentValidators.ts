import * as moment from 'moment'
import { BinderValidationResult, BinderValidator } from 'mobx-binder'

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

    public static age(minAge?: number, maxAge?: number, messageKey = 'validations.age'): BinderValidator<moment.Moment> {
        return (value) => {
            if (moment.isMoment(value)) {
                const theAge = moment().diff(value, 'years')
                return MomentValidators.validate(
                    (!!minAge && theAge < minAge) || (!!maxAge && theAge > maxAge),
                    messageKey,
                    { minAge, maxAge, value })
            }
            return {}
        }
    }

    public static todayOrInPast(messageKey = 'validations.todayOrInPast'): BinderValidator<moment.Moment> {
        return (value) => MomentValidators.validate(moment.isMoment(value) && value.diff(moment(), 'days') > 0, messageKey, { value })
    }

    private static validate(errorCondition: boolean, message: string, args?: any): BinderValidationResult {
        return errorCondition ? { messageKey: message, args } : {}
    }
}
