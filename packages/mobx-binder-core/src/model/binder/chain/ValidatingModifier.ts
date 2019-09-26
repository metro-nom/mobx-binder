import { Data, Modifier, Validity, ValidValueValidationResult, ValueValidationResult } from './Modifier'
import { Context } from '../Context'
import { Validator } from '../../../validation/Validator'
import { AbstractModifier } from './AbstractModifier'

export class ValidatingModifier<ValidationResult, ValueType> extends AbstractModifier<ValidationResult, ValueType, ValueType> {
    constructor(
        view: Modifier<ValidationResult, any, ValueType>,
        context: Context<ValidationResult>,
        private validator: Validator<ValidationResult, ValueType>,
    ) {
        super(view, context)
    }

    get data(): Data<ValueType> {
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

    public async validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        return this.calculateValidity(await this.view.validateAsync(blurEvent))
    }

    private calculateValidity(upstreamValidity: Validity<ValidationResult>): Validity<ValidationResult> {
        if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result)) {
            return upstreamValidity
        } else {
            const data = this.view.data
            if (data.pending) {
                return {
                    status: 'unknown',
                }
            } else {
                return {
                    status: 'validated',
                    result: this.validator(data.value),
                }
            }
        }
    }

    protected validateValueLocally(viewResult: ValidValueValidationResult<ValueType>): ValueValidationResult<ValueType, ValidationResult> {
        const result = this.validator(viewResult.value)
        return this.context.valid(result) ? viewResult : { valid: false, result }
    }
}
