import isEqual from 'lodash/isEqual.js'

import type {AsyncConverter} from './Converter'
import type {Condition} from '../condition/Condition'

export class AsyncConditionalConverter<ValidationResult, ValueType> implements AsyncConverter<ValidationResult, ValueType, ValueType> {
    constructor(private inner: AsyncConverter<ValidationResult, ValueType, ValueType>, private condition?: Condition) {}

    public async convertToModel(value: ValueType): Promise<ValueType> {
        if (!this.condition || this.condition.matches()) {
            return await this.inner.convertToModel(value)
        }
        return value
    }

    public convertToPresentation(data: ValueType): ValueType {
        if (!this.condition || this.condition.matches()) {
            return this.inner.convertToPresentation(data)
        }
        return data as ValueType
    }

    public isEqual(first: ValueType, second: ValueType): boolean {
        if (this.inner.isEqual && (!this.condition || this.condition.matches())) {
            return this.inner.isEqual(first, second)
        }
        return isEqual(first, second)
    }
}
