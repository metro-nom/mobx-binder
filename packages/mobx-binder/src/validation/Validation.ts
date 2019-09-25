import { Validator } from 'mobx-binder-core'

export type BinderValidationResult = InvalidBinderValidationResult | ValidBinderValidationResult

export interface InvalidBinderValidationResult {
    messageKey: string
    args?: { [s: string]: any }
}

export type ValidBinderValidationResult = {}

export type BinderValidator<T> = Validator<BinderValidationResult, T>
