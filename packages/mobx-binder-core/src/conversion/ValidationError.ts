export class ValidationError<ValidationResult> extends Error {
    constructor(public readonly validationResult: ValidationResult) {
        super('validation error')
    }
}

export function isValidationError<ValidationResult = any>(err: Error): err is ValidationError<ValidationResult> {
    return err.hasOwnProperty('validationResult')
}
