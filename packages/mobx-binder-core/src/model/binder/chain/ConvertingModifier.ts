import { Modifier, Validity } from './Modifier'
import { Converter } from '../../../conversion/Converter'
import { Context } from '../Context'
import { AbstractModifier } from './AbstractModifier'

export class ConvertingModifier<ValidationResult, ViewType, ModelType> extends AbstractModifier<ValidationResult, ViewType, ModelType> {
    constructor(
        view: Modifier<ValidationResult, any, ViewType>,
        context: Context<ValidationResult>,
        private converter: Converter<ValidationResult, ViewType, ModelType>
    ) {
        super(view, context)
    }

    get data() {
        const data = this.view.data
        if (data.pending) {
            return { pending: true }
        }
        try {
            const value = this.converter.convertToModel(data.value!)
            return {
                pending: false,
                value,
            }
        } catch (err) {
            if (err.validationResult) {
                return { pending: true }
            }
            throw err
        }
    }

    get validity(): Validity<ValidationResult> {
        const result = this.view.validity
        return this.calculateValidity(result)
    }


    public toView(modelValue: any) {
        return this.view.toView(this.converter.convertToPresentation(modelValue))
    }

    public async validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        return this.calculateValidity(await this.view.validateAsync(blurEvent))
    }

    private calculateValidity(upstreamValidity: Validity<ValidationResult>): Validity<ValidationResult> {
        if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result!)) {
            return upstreamValidity
        } else {
            const upstreamData = this.view.data
            if (upstreamData.pending) {
                return { status: 'unknown' }
            }
            try {
                this.converter.convertToModel(upstreamData.value!)
                return {
                    status: 'validated',
                    result: this.context.validResult,
                }
            } catch (err) {
                if (err.validationResult) {
                    return {
                        status: 'validated',
                        result: err.validationResult,
                    }
                }
                throw err
            }
        }
    }
}
