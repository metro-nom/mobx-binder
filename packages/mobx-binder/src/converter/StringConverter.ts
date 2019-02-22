import { Converter } from './Converter'

export class StringConverter implements Converter<string, string, any> {

    public convertToModel(value: string): string | undefined {
        return value === '' ? undefined : value
    }

    public convertToPresentation(data?: string): string {
        return data || ''
    }
}
