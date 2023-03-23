import isEqual from 'lodash/isEqual.js'

import type { Converter } from './Converter.js'
import type { Condition } from '../condition/Condition.js'

export class ConditionalConverter<ValidationResult, ViewType, ModelType> implements Converter<ValidationResult, ViewType, ModelType | ViewType> {
    constructor(private inner: Converter<ValidationResult, ViewType, ModelType>, private condition?: Condition) {}

    public convertToModel(value: ViewType): ModelType | ViewType {
        if (!this.condition || this.condition.matches()) {
            return this.inner.convertToModel(value)
        }
        return value
    }

    public convertToPresentation(data: ModelType | ViewType): ViewType {
        if (!this.condition || this.condition.matches()) {
            return this.inner.convertToPresentation(data as ModelType)
        }
        return data as ViewType
    }

    public isEqual(first: ModelType | ViewType, second: ModelType | ViewType): boolean {
        if (this.inner.isEqual && (!this.condition || this.condition.matches())) {
            return this.inner.isEqual(first as ModelType, second as ModelType)
        }
        return isEqual(first, second)
    }
}
