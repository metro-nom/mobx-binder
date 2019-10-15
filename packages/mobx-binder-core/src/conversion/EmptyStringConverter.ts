import { Converter } from './Converter'

export class EmptyStringConverter<X> implements Converter<any, string, string | X> {
    constructor(private targetValue: X) {}

    public convertToModel(value: string): string | X {
        return value === '' ? this.targetValue : value
    }

    public convertToPresentation(data: string | X): string {
        return data === this.targetValue ? '' : (data as string)
    }
}
