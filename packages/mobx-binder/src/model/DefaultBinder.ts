import { Binder, Context, Validator } from 'mobx-binder-core'
import { StringValidators } from '../validation/StringValidators'

export type TranslateFunction = (translationKey: string, args?: any) => string
export type BinderValidator<T> = Validator<BinderValidationResult, T>

export interface BinderValidationResult {
    messageKey?: string
    args?: { [ s: string ]: any }
}

export interface DefaultContextOptions {
    t: TranslateFunction
}

export class DefaultContext implements Context<BinderValidationResult> {
    public readonly requiredValidator = StringValidators.required
    public readonly validResult = {}

    constructor(private options: DefaultContextOptions) {}

    public readonly translate = (result: BinderValidationResult) => this.options.t(result.messageKey!, result.args)
    public readonly valid = (result: BinderValidationResult) => !result.messageKey
}

export class DefaultBinder extends Binder<BinderValidationResult> {
    constructor(options: DefaultContextOptions) {
        super(new DefaultContext(options))
    }
}
