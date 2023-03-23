import isEqual from 'lodash/isEqual.js'

import type { AsyncConverter } from './Converter'
import type { Condition } from '../condition/Condition'

export class AsyncConditionalConverter<ValidationResult, ViewType, ModelType> implements AsyncConverter<ValidationResult, ViewType, ModelType | ViewType> {
    constructor(private inner: AsyncConverter<ValidationResult, ViewType, ModelType>, private condition?: Condition) {}

    public async convertToModel(value: ViewType): Promise<ModelType | ViewType> {
        if (!this.condition || this.condition.matches()) {
            return await this.inner.convertToModel(value)
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
