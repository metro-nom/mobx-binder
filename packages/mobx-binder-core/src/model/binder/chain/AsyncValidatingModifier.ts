import { action, computed, observable, runInAction } from 'mobx'
import { Modifier, Validity } from './Modifier'
import { Context } from '../Context'
import { AsyncValidator } from '../../../validation/Validator'

export class AsyncValidatingModifier<ValidationResult, ValueType> implements Modifier<ValidationResult, ValueType, ValueType> {
    @observable
    private status: 'initial' | 'validating' | 'validated' = 'initial'

    @observable
    private validatedValue?: ValueType

    @observable
    private lastValidationResult?: ValidationResult

    constructor(
        private view: Modifier<ValidationResult, any, ValueType>,
        private validator: AsyncValidator<ValidationResult, ValueType>,
        private context: Context<ValidationResult>,
        private options: { onBlur: boolean },
        public field = view.field) {
    }

    get data() {
        const data = this.view.data
        if (this.status === 'validated' && data.value === this.validatedValue && this.context.valid(this.lastValidationResult!)) {
            return data
        }
        return {
            pending: true,
        }
    }

    @computed
    get validity(): Validity<ValidationResult> {
        const upstreamValidity = this.view.validity
        const status = this.status

        if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result!)) {
            return upstreamValidity
        }
        if (status === 'validated' && this.view.data.value === this.validatedValue) { // TODO equality
            return {
                status: 'validated',
                result: this.lastValidationResult,
            }
        }
        return {
            status: status === 'validating' ? 'validating' : 'unknown',
        }
    }

    public toView(modelValue: any) {
        return this.view.toView(modelValue)
    }

    public async validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        const upstreamValidity = await this.view.validateAsync(blurEvent)
        if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result!)) {
            return upstreamValidity
        }
        const upstreamData = this.view.data
        if (this.status === 'initial' || this.status === 'validating' || upstreamData.value !== this.validatedValue) {
            if (!blurEvent || this.options.onBlur) {
                const result = await this.startNewValidation(upstreamData.value!)
                return {
                    status: 'validated',
                    result,
                }
            }
            return {
                status: this.status === 'validating' ? 'validating' : 'unknown',
            }
        }
        return {
            status: 'validated',
            result: this.lastValidationResult,
        }
    }

    @action
    private async startNewValidation(value: ValueType): Promise<ValidationResult> {
        this.validatedValue = value
        this.status = 'validating'

        const result = await this.validator(value)

        runInAction(() => {
            if (value === this.validatedValue) {
                this.status = 'validated'
                this.validatedValue = value
                this.lastValidationResult = result
            }
        })
        return result
    }
}
