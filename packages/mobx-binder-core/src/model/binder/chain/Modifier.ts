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

export type SyncValueValidationResult<ViewType, ValidationResult> = ValidValueValidationResult<ViewType> | InvalidValueValidationResult<ValidationResult>

export type ValueValidationResult<ViewType, ValidationResult> =
    | SyncValueValidationResult<ViewType, ValidationResult>
    | Promise<SyncValueValidationResult<ViewType, ValidationResult>>

export interface ValidValueValidationResult<ViewType> {
    valid: true
    value: ViewType
}

export interface InvalidValueValidationResult<ValidationResult> {
    valid: false
    result: ValidationResult
}

export interface Modifier<ValidationResult, ViewType, ModelType> {
    field: FieldStore<unknown>
    data: Data<ModelType>
    validity: Validity<ValidationResult>
    toView(modelValue: any): ViewType
    isEqual(first: ModelType, second: ModelType): boolean
    applyConversionsToField(): void
    validateValue(fieldValue: any): ValueValidationResult<ModelType, ValidationResult>
    validateAsync(onBlur: boolean): Promise<Validity<ValidationResult>>
}
