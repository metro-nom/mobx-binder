
export class ValidationError<ValidationResult> extends Error {
    constructor(public readonly result: ValidationResult) {
        super('validation error')
    }
}
