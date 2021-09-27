/**
 * Interface to be fulfilled by any converter for use with `withConverter`
 */
export interface Converter<_ValidationResult, ViewType, ModelType> {
    readonly label?: string
    convertToModel(value: ViewType): ModelType
    convertToPresentation(data: ModelType): ViewType
    isEqual?(first: ModelType, second: ModelType): boolean
}

/**
 * Interface to be fulfilled by any asynchronous converter for use with `withAsyncConverter`
 */
export interface AsyncConverter<_ValidationResult, ViewType, ModelType> {
    readonly label?: string
    convertToModel(value: ViewType): Promise<ModelType>
    convertToPresentation(data: ModelType): ViewType
    isEqual?(first: ModelType, second: ModelType): boolean
}
