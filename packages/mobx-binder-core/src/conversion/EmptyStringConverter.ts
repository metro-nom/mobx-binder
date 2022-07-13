import { Converter } from './Converter'
import { createLabel } from '../validation/Labels'

export class EmptyStringConverter<X> implements Converter<any, string, string | X> {
    readonly label: string

    constructor(private targetValue: X) {
        this.label = createLabel('EmptyStringConverter', { targetValue })
    }

    public convertToModel(value: string): string | X {
        return value === '' ? this.targetValue : value
    }

    public convertToPresentation(data: string | X): string {
        return data === this.targetValue ? '' : (data as string)
    }
}
