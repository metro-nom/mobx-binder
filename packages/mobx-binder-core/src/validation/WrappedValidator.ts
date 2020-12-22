import { Validator } from './Validator'

export interface WrappedValidator<ValidationResult, T> extends Validator<ValidationResult, T> {
    required?: () => boolean
}

export function isWrapper<ValidationResult, T>(validator: Validator<ValidationResult, T>): validator is WrappedValidator<ValidationResult, T> {
    return (validator as object).hasOwnProperty('required')
}

export function wrapRequiredValidator<ValidationResult, T>(validator: Validator<ValidationResult, T>, required: () => boolean = () => true) {
    return Object.assign((value: T): ValidationResult => validator(value), { required })
}
