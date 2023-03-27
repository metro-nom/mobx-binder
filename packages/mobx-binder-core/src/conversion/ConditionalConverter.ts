import isEqual from 'lodash/isEqual.js'

import type {Converter} from './Converter.js'
import type {Condition} from '../condition/Condition.js'

export class ConditionalConverter<ValidationResult, ViewType> implements Converter<ValidationResult, ViewType, ViewType> {
    constructor(private inner: Converter<ValidationResult, ViewType, ViewType>, private condition?: Condition) {}

    public convertToModel(value: ViewType): ViewType {
        if (!this.condition || this.condition.matches()) {
            return this.inner.convertToModel(value)
        }
        return value
    }

    public convertToPresentation(data: ViewType): ViewType {
        if (!this.condition || this.condition.matches()) {
            return this.inner.convertToPresentation(data)
        }
        return data as ViewType
    }

    public isEqual(first: ViewType, second: ViewType): boolean {
        if (this.inner.isEqual && (!this.condition || this.condition.matches())) {
            return this.inner.isEqual(first, second)
        }
        return isEqual(first, second)
    }
}
