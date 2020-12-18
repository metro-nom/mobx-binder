export type Validity<ValidationResult> = KnownValidity<ValidationResult> | UnknownValidity<ValidationResult>

/**
 * UnknownValidity - only occurs if there are async validators or modifiers in the chain.
 */
export interface UnknownValidity<ValidationResult> {
    /**
     * validity status:
     * *unknown*: validation has not yet started
     * *validating*: validation is in progress
     */
    status: 'unknown' | 'validating'
    result?: ValidationResult
}

/**
 * KnownValidity - field is validated and validation result can be provided.
 */
export interface KnownValidity<ValidationResult> {
    status: 'validated'
    result: ValidationResult
}

export function isValidated<ValidationResult>(validity: Validity<ValidationResult>): validity is KnownValidity<ValidationResult> {
    return validity.status === 'validated'
}
