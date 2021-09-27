import { Validator } from './Validator'
import { withLabel } from './Labels'

export interface WrappedValidator<ValidationResult, T> extends Validator<ValidationResult, T> {
    required: () => boolean
}

export function isWrapper<ValidationResult, T>(validator: Validator<ValidationResult, T>): validator is WrappedValidator<ValidationResult, T> {
    return (validator as object).hasOwnProperty('required')
}

export function wrapRequiredValidator<ValidationResult, T>(
    validator: Validator<ValidationResult, T>,
    required: () => boolean = () => true,
): WrappedValidator<ValidationResult, T> {
    return Object.assign(
        withLabel('required', { value: required() }, (value: T): ValidationResult => validator(value)),
        { required },
    )
}
