import { BinderValidationResult, BinderValidator } from './Validation'
import { withLabel } from 'mobx-binder-core'

export class StringValidators {
    public static matchLength(match: number, messageKey = 'validations.matchLength'): BinderValidator<string> {
        return withLabel('matchLength', { match }, value => StringValidators.validate(!!value && value.length !== match, messageKey, { value, match }))
    }

    public static minLength(min: number, messageKey = 'validations.minLength'): BinderValidator<string> {
        return withLabel('minLength', { min }, value => StringValidators.validate(!!value && value.length < min, messageKey, { value, min }))
    }

    public static maxLength(max: number, messageKey = 'validations.maxLength'): BinderValidator<string> {
        return withLabel('maxLength', { max }, value => StringValidators.validate(!!value && value.length > max, messageKey, { value, max }))
    }

    public static lengths(min: number, max: number, messageKey = 'validations.lengths'): BinderValidator<string> {
        return withLabel('lengths', { min, max }, value =>
            StringValidators.validate(!!value && (value.length < min || value.length > max), messageKey, { value, min, max }),
        )
    }

    public static required<T>(messageKey = 'validations.required'): BinderValidator<T> {
        return withLabel('required', { value: true }, value =>
            StringValidators.validate(value === undefined || value === null || (typeof value === 'string' && value === ''), messageKey),
        )
    }

    public static equals<T>(expectedValue: string | boolean, messageKey = 'validations.equals'): BinderValidator<T> {
        return withLabel('equals', { expectedValue }, value =>
            StringValidators.validate(
                (typeof value === 'string' && value !== expectedValue) || (typeof value === 'boolean' && value !== expectedValue),
                messageKey,
                { value },
            ),
        )
    }

    public static regexp(regexp: RegExp, messageKey = 'validations.regexp'): BinderValidator<string> {
        return withLabel('regexp', { regexp }, value => {
            regexp.lastIndex = 0
            const mismatch = !!value && !regexp.test(value)
            return StringValidators.validate(mismatch, messageKey, { value, regexp: regexp.toString() })
        })
    }

    public static noWhitespaces(messageKey = 'validations.noWhitespaces'): BinderValidator<string> {
        return withLabel('noWhitespaces', value => StringValidators.validate(!!value && /\s/.test(value), messageKey, { value }))
    }

    private static validate(errorCondition: boolean, message: string, args?: any): BinderValidationResult {
        return errorCondition ? { messageKey: message, args } : {}
    }
}
