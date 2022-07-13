export class ValidationError<ValidationResult> extends Error {
    constructor(public readonly validationResult: ValidationResult) {
        super('validation error')
    }
}

export function isValidationError<ValidationResult = any>(err: unknown): err is ValidationError<ValidationResult> {
    return (err as Error).hasOwnProperty('validationResult')
}
