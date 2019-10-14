import { Converter, ValidationError } from '..'
import { ErrorMessage } from '../model/binder/SimpleBinder'

export class SimpleNumberConverter implements Converter<ErrorMessage, string, number> {
    public convertToModel(value: string): number {
        if (value === 'internal error') {
            throw new Error('fail on internal error')
        }
        if (isNaN(Number(value))) {
            throw new ValidationError('Not a number')
        }
        return Number(value)
    }

    public convertToPresentation(data?: number): string {
        return data !== undefined ? `${data}` : ''
    }
}
