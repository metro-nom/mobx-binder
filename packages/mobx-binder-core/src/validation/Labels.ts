import { Validator } from './Validator'

export interface LabeledValidator<ValidationResult, T> extends Validator<ValidationResult, T> {
    label: string
}

export function isLabeled<ValidationResult, T>(validator: Validator<ValidationResult, T>): validator is LabeledValidator<ValidationResult, T> {
    return (validator as object).hasOwnProperty('label')
}

const createArgumentString = (data: Record<string, unknown>) => {
    if (!data) {
        return ''
    }
    const parts = Object.keys(data)
        .reduce((parts: string[], key: string) => {
            const value = data[key]
            if (value !== undefined) {
                parts.push(`${key}=${JSON.stringify(value)}`)
            }
            return parts
        }, [])
        .join(',')
    return parts.length ? `(${parts})` : ''
}

export const createLabel = (name: string, args: Record<string, unknown>) => {
    return `${name}${createArgumentString(args)}`
}

export function withLabel<ValidationResult, T>(label: string, validator: Validator<ValidationResult, T>): LabeledValidator<ValidationResult, T>
export function withLabel<ValidationResult, T>(
    label: string,
    params: Record<string, unknown>,
    validator: Validator<ValidationResult, T>,
): LabeledValidator<ValidationResult, T>
export function withLabel<ValidationResult, T>(
    label: string,
    second: Record<string, unknown> | Validator<ValidationResult, T>,
    validator?: Validator<ValidationResult, T>,
): LabeledValidator<ValidationResult, T> {
    if (validator && typeof second === 'object') {
        return Object.assign((value: T) => validator(value), { label: createLabel(label, second) })
    } else if (typeof second === 'function') {
        return Object.assign((value: T) => second(value), { label })
    }
    throw new Error('Illegal arguments passed to "withLabel"')
}
