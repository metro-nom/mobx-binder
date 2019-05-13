import { Converter } from './Converter'

export class TrimConverter implements Converter<any, string | undefined, string> {

    public convertToModel(value?: string | undefined): string | undefined {
        const trimmed = !!value ? value.trim() : value
        return trimmed === '' ? undefined : trimmed
    }

    public convertToPresentation(data?: string): string | undefined {
        return data
    }
}
