export interface Converter<_ValidationResult, ViewType, ModelType> {
    convertToModel(value?: ViewType): ModelType
    convertToPresentation(data?: ModelType): ViewType
    isEqual?(first: ModelType, second: ModelType): boolean
}
