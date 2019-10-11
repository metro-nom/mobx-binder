import { AsyncConverter, BinderValidationResult } from 'mobx-binder'
import sleep from './sleep'

export class AsyncPhoneNumberConverter implements AsyncConverter<BinderValidationResult, string | undefined, string | undefined> {
    public async convertToModel(value?: string): Promise<string | undefined> {
        await sleep(500)
        return value === undefined ? undefined : value.replace('00', '+')
    }

    public convertToPresentation(data?: string): string | undefined {
        return data
    }
}
