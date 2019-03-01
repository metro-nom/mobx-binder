
export interface FieldStore<ValueType> {
    readonly name: string
    readonly valueType: string
    changed: boolean
    showValidationResults: boolean
    value?: ValueType
    valid?: boolean
    visited: boolean
    validating?: boolean
    errorMessage?: string
    readOnly: boolean
    required: boolean
    updateValue(newValue: ValueType): void
    handleBlur(): void
    handleFocus(): void
    reset(newValue: ValueType): void
}
