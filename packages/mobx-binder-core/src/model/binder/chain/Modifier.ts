import { FieldStore } from '../../fields/FieldStore'

export type Data<ValueType> = KnownData<ValueType> | UnknownData<ValueType>

export interface KnownData<ValueType> {
    pending: false
    value: ValueType
}

export interface UnknownData<ValueType> {
    pending: true
    value?: ValueType
}

export type Validity<ValidationResult> = KnownValidity<ValidationResult> | UnknownValidity<ValidationResult>

export interface UnknownValidity<ValidationResult> {
    status: 'unknown' | 'validating'
    result?: ValidationResult
}

export interface KnownValidity<ValidationResult> {
    status: 'validated'
    result: ValidationResult
}

export interface Modifier<ValidationResult, ViewType, ModelType> {
    field: FieldStore<unknown>
    data: Data<ModelType>
    validity: Validity<ValidationResult>
    toView(
        modelValue: any,
    ): {
        value?: ViewType
    }
    isEqual(first: ModelType, second: ModelType): boolean
    applyConversionsToField(): void
    validateAsync(onBlur: boolean): Promise<Validity<ValidationResult>>
}
