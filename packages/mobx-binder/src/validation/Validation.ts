import { Validator } from 'mobx-binder-core'

export interface BinderValidationResult {
    messageKey?: string
    args?: { [s: string]: any }
}

export type BinderValidator<T> = Validator<BinderValidationResult, T>
