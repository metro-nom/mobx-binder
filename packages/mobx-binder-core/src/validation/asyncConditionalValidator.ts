import { AsyncValidator } from './Validator'
import { Condition } from '../condition/Condition'
import { isLabeled, withLabel } from './Labels'

export function asyncConditionalValidator<ValidationResult, T>(
    validate: AsyncValidator<ValidationResult, T>,
    condition: Condition,
    validValue: ValidationResult,
): AsyncValidator<ValidationResult, T> {
    const name = isLabeled(validate) ? validate.label : validate.name
    return withLabel<ValidationResult, T>(`conditional:${name}`, async (value: T) => {
        if (condition.matches()) {
            return await validate(value)
        } else {
            return validValue
        }
    })
}
