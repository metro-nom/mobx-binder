import { FieldStore } from '../../fields/FieldStore'

export interface Data<ValueType> {
    pending: boolean
    value?: ValueType
}

export interface Validity<ValidationResult> {
    status: 'unknown' | 'validating' | 'validated'
    result?: ValidationResult
}

export interface Modifier<ValidationResult, ViewType, ModelType> {
    field: FieldStore<unknown>
    data: Data<ModelType>
    validity: Validity<ValidationResult>
    toView(modelValue: any): {
        value?: ViewType
    }
    isEqual(first: ModelType, second: ModelType): boolean
    applyConversionsToField(): void
    validateAsync(onBlur: boolean): Promise<Validity<ValidationResult>>
}
