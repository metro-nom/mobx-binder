import moment from 'moment'
import { BinderValidationResult, BinderValidator, withLabel } from 'mobx-binder'

export class MomentValidators {
    public static dayInFuture(messageKey = 'validations.dayInFuture'): BinderValidator<moment.Moment> {
        return withLabel('dayInFuture', value =>
            MomentValidators.validate(moment.isMoment(value) && value.diff(MomentValidators.today(), 'days') <= 0, messageKey, { value }),
        )
    }

    public static todayOrInFuture(messageKey = 'validations.todayOrInFuture'): BinderValidator<moment.Moment> {
        return withLabel('todayOrInFuture', value =>
            MomentValidators.validate(moment.isMoment(value) && value.diff(MomentValidators.today(), 'days') < 0, messageKey, { value }),
        )
    }

    public static dayInPast(messageKey = 'validations.dayInPast'): BinderValidator<moment.Moment> {
        return withLabel('dayInPast', value =>
            MomentValidators.validate(moment.isMoment(value) && value.diff(MomentValidators.today(), 'days') >= 0, messageKey, { value }),
        )
    }

    public static age(minAge?: number, maxAge?: number, messageKey = 'validations.age'): BinderValidator<moment.Moment> {
        return withLabel('age', { minAge, maxAge }, value => {
            if (moment.isMoment(value)) {
                const theAge = MomentValidators.today().diff(value, 'years')
                return MomentValidators.validate((!!minAge && theAge < minAge) || (!!maxAge && theAge > maxAge), messageKey, { minAge, maxAge, value })
            }
            return {}
        })
    }

    public static todayOrInPast(messageKey = 'validations.todayOrInPast'): BinderValidator<moment.Moment> {
        return withLabel('todayOrInPast', value =>
            MomentValidators.validate(moment.isMoment(value) && value.diff(MomentValidators.today(), 'days') > 0, messageKey, { value }),
        )
    }

    private static validate(errorCondition: boolean, message: string, args?: any): BinderValidationResult {
        return errorCondition ? { messageKey: message, args } : {}
    }

    private static today = () => moment()
}
