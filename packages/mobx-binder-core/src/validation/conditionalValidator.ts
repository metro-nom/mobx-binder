import { Validator } from './Validator'
import { isLabeled, withLabel } from './Labels'
import { Condition } from '../condition/Condition'

export function conditionalValidator<ValidationResult, T>(
    validate: Validator<ValidationResult, T>,
    condition: Condition,
    validValue: any = undefined,
): Validator<ValidationResult, T> {
    const name = isLabeled(validate) ? validate.label : validate.name
    return withLabel(`conditional:${name}`, (value: T) => (condition.matches() ? validate(value) : validValue))
}
