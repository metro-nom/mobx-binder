import { AsyncConverter } from '../conversion/Converter'
import { ErrorMessage } from '../model/binder/SimpleBinder'
import sleep from '../utils/sleep'
import { ValidationError } from '..'

export class SimpleAsyncNumberConverter implements AsyncConverter<ErrorMessage, string | undefined, number | undefined> {
    public async convertToModel(value?: string): Promise<number | undefined> {
        await sleep(10)
        if (value === undefined) {
            return undefined
        }
        if (value === 'internal error') {
            throw new Error('fail on internal error')
        }
        const modelValue = Number(value)
        if (isNaN(modelValue)) {
            throw new ValidationError('not a number')
        }
        return Number(value)
    }

    public convertToPresentation(data?: number): string | undefined {
        if (data === undefined) {
            return undefined
        }
        return `${data}`
    }
}
