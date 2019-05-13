import { Modifier, Validity } from './Modifier'
import { Context } from '../Context'
import { Validator } from '../../../validation/Validator'

export class ValidatingModifier<ValidationResult, ValueType> implements Modifier<ValidationResult, ValueType, ValueType> {
    constructor(
        private view: Modifier<ValidationResult, any, ValueType>,
        private validator: Validator<ValidationResult, ValueType>,
        private context: Context<ValidationResult>,
        public field = view.field) {
    }

    get data() {
        const data = this.view.data
        if (data.pending) {
            return data
        } else {
            const result = this.validator(data.value)
            if (this.context.valid(result)) {
                return data
            }
            return {
                pending: true,
            }
        }
    }

    get validity() {
        return this.calculateValidity(this.view.validity)
    }

    public toView(modelValue: any) {
        return this.view.toView(modelValue)
    }

    public async validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        return this.calculateValidity(await this.view.validateAsync(blurEvent))
    }

    private calculateValidity(upstreamValidity: Validity<ValidationResult>): Validity<ValidationResult> {
        if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result!)) {
            return upstreamValidity
        } else {
            return {
                status: 'validated',
                result: this.validator(this.view.data.value),
            }
        }
    }
}
