import {Binder, BindingBuilder, Context, FieldStore} from 'mobx-binder-core'
import {StringValidators} from '../validation/StringValidators'
import {
    BinderValidationResult,
    BinderValidator,
    InvalidBinderValidationResult,
    ValidBinderValidationResult
} from '../validation/Validation'
import {TranslateFunction} from './Translation'

export interface DefaultContextOptions {
    t: TranslateFunction
    requiredValidator?: () => BinderValidator<any>
}

export class DefaultContext implements Context<BinderValidationResult> {
    public readonly requiredValidator: () => BinderValidator<any>
    public readonly validResult: ValidBinderValidationResult = {}

    constructor(private options: DefaultContextOptions) {
        this.requiredValidator = options.requiredValidator ?? StringValidators.required
    }

    public translate(result: BinderValidationResult) {
        return this.invalid(result) ? this.options.t(result.messageKey, result.args) : ''
    }

    public valid(result: BinderValidationResult): result is ValidBinderValidationResult {
        return !result.hasOwnProperty('messageKey')
    }

    private invalid(result: BinderValidationResult): result is InvalidBinderValidationResult {
        return !this.valid(result)
    }
}

export class DefaultBinder extends Binder<BinderValidationResult> {
    constructor(options: DefaultContextOptions) {
        super(new DefaultContext(options))
    }

    public forField<ValueType>(field: FieldStore<ValueType>): BindingBuilder<BinderValidationResult, ValueType, DefaultBinder> {
        return super.forField(field) as BindingBuilder<BinderValidationResult, ValueType, DefaultBinder>
    }
}
