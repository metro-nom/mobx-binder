/**
 * Interface to be fulfulled by any converter for use with `withConverter`
 */
export interface Converter<_ValidationResult, ViewType, ModelType> {
    convertToModel(value?: ViewType): ModelType
    convertToPresentation(data?: ModelType): ViewType
    isEqual?(first: ModelType, second: ModelType): boolean
}

/**
 * Interface to be fulfulled by any asynchronous converter for use with `withAsyncConverter`
 */
export interface AsyncConverter<_ValidationResult, ViewType, ModelType> {
    convertToModel(value?: ViewType): Promise<ModelType>
    convertToPresentation(data?: ModelType): ViewType
    isEqual?(first: ModelType, second: ModelType): boolean
}
