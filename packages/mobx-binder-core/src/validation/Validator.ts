/**
 * Interface to be fulfulled by any validator for use with `withValidator`
 */
export type Validator<ValidationResult, T> = (value?: T) => ValidationResult

/**
 * Interface to be fulfulled by any asynchronous validator for use with `withAsyncValidator`
 */
export type AsyncValidator<ValidationResult, T> = (value?: T) => Promise<ValidationResult>
