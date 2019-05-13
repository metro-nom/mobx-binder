export class ValidationError<ValidationResult> extends Error {
    constructor(public readonly validationResult: ValidationResult) {
        super('validation error')
    }
}
