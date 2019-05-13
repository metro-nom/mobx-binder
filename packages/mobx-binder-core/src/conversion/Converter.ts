export interface Converter<_ValidationResult, ViewType, ModelType> {
    convertToModel(value: ViewType): ModelType | undefined
    convertToPresentation(data?: ModelType): ViewType | undefined
    isEqual?(first: ModelType, second: ModelType): boolean
}
