import { Modifier, Validity } from './Modifier'
import { Converter } from '../../../conversion/Converter'
import { Context } from '../Context'

export class ConvertingModifier<ValidationResult, ViewType, ModelType> implements Modifier<ValidationResult, ViewType, ModelType> {
    constructor(
        private view: Modifier<ValidationResult, any, ViewType>,
        private converter: Converter<ValidationResult, ViewType, ModelType>,
        private context: Context<ValidationResult>,
        public field = view.field) {
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
        if (result.status !== 'validated' || !this.context.valid(result.result!)) {
            return result
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

    public toView(modelValue: any) {
        return this.view.toView(this.converter.convertToPresentation(modelValue))
    }

    public validateAsync(onBlur: boolean): Promise<Validity<ValidationResult>> {
        return this.view.validateAsync(onBlur)
    }
}
