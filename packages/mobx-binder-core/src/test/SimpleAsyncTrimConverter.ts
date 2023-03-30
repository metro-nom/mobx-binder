import {AsyncConverter} from '../conversion/Converter'
import {ErrorMessage} from '../model/binder/SimpleBinder'
import sleep from '../utils/sleep'
import {ValidationError} from "../conversion/ValidationError";

export class SimpleAsyncTrimConverter implements AsyncConverter<ErrorMessage, string | undefined, string | undefined> {
    public async convertToModel(value?: string): Promise<string | undefined> {
        await sleep(10)
        if (value === undefined) {
            return undefined
        }
        if (value === 'internal error') {
            throw new Error('fail on internal error')
        }
        if (value === 'validation error') {
            throw new ValidationError('fail on validation error')
        }
        return value.trim()
    }

    public convertToPresentation(data?: string | undefined): string | undefined {
        if (data === undefined) {
            return undefined
        }
        return `${data}`
    }
}
