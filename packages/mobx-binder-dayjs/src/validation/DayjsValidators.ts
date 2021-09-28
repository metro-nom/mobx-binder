import { BinderValidationResult, BinderValidator, withLabel } from 'mobx-binder'
import dayjs, { Dayjs, isDayjs } from 'dayjs'

export class DayjsValidators {
    public static dayInFuture(messageKey = 'validations.dayInFuture'): BinderValidator<Dayjs> {
        return withLabel('dayInFuture', value =>
            DayjsValidators.validate(isDayjs(value) && value.diff(DayjsValidators.today(), 'day') <= 0, messageKey, { value }),
        )
    }

    public static todayOrInFuture(messageKey = 'validations.todayOrInFuture'): BinderValidator<Dayjs> {
        return withLabel('todayOrInFuture', value =>
            DayjsValidators.validate(isDayjs(value) && value.diff(DayjsValidators.today(), 'day') < 0, messageKey, { value }),
        )
    }

    public static dayInPast(messageKey = 'validations.dayInPast'): BinderValidator<Dayjs> {
        return withLabel('dayInPast', value =>
            DayjsValidators.validate(isDayjs(value) && value.diff(DayjsValidators.today(), 'day') >= 0, messageKey, { value }),
        )
    }

    public static age(minAge?: number, maxAge?: number, messageKey = 'validations.age'): BinderValidator<Dayjs> {
        return withLabel('age', { minAge, maxAge }, value => {
            if (isDayjs(value)) {
                const theAge = DayjsValidators.today().diff(value, 'year')
                return DayjsValidators.validate((!!minAge && theAge < minAge) || (!!maxAge && theAge > maxAge), messageKey, { minAge, maxAge, value })
            }
            return {}
        })
    }

    public static todayOrInPast(messageKey = 'validations.todayOrInPast'): BinderValidator<Dayjs> {
        return withLabel('todayOrInPast', value =>
            DayjsValidators.validate(isDayjs(value) && value.diff(DayjsValidators.today(), 'day') > 0, messageKey, { value }),
        )
    }

    private static validate(errorCondition: boolean, message: string, args?: any): BinderValidationResult {
        return errorCondition ? { messageKey: message, args } : {}
    }

    private static today = () => dayjs()
}
