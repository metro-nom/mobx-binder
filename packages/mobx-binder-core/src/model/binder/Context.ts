import { Validator } from '../../validation/Validator'

export interface Context<ValidationResult> {
    /**
     * The function used to translate validation results.
     */
    readonly translate: (result: ValidationResult) => string
    /**
     * A function used to check if a validation result means that validation was successful, or not.
     */
    readonly valid: (result: ValidationResult) => boolean

    /**
     * The return value of _validate()_ / _validateAsync_ in case there is no validator configured.
     */
    readonly validResult: ValidationResult

    /**
     * A function that returns a Validator which is added to the validator chain on `.isRequired()`.
     */
    readonly requiredValidator: (messageKey?: string) => Validator<ValidationResult, any>
}
