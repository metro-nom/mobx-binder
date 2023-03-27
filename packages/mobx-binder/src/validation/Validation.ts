import {Validator} from 'mobx-binder-core'

export type BinderValidationResult = InvalidBinderValidationResult | ValidBinderValidationResult

export interface InvalidBinderValidationResult {
    messageKey: string
    args?: { [s: string]: any }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type ValidBinderValidationResult = {}

export type BinderValidator<T> = Validator<BinderValidationResult, T>
