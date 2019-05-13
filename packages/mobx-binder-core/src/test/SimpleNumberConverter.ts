import { Converter, ValidationError } from '..'
import { ErrorMessage } from '../model/binder/SimpleBinder'

export class SimpleNumberConverter implements Converter<ErrorMessage, string, number> {
    public convertToModel(value: string): number | undefined {
        if (isNaN(Number(value))) {
            throw new ValidationError('Not a number')
        }
        return Number(value)
    }

    public convertToPresentation(data?: number): string | undefined {
        return data !== undefined ? `${data}` : ''
    }
}
