import { Modifier, Validity } from './Modifier'
import { Converter } from '../../../conversion/Converter'
import { Context } from '../Context'
import { ValidationError } from '../../../conversion/ValidationError'

export class ConvertingModifier<ValidationResult, ViewType, ModelType> implements Modifier<ValidationResult, ViewType, ModelType> {
    constructor(
        private view: Modifier<ValidationResult, any, ViewType>,
        private converter: Converter<ValidationResult, ViewType, ModelType>,
        private context: Context<ValidationResult>,
        public field = view.field) {
    }

    get data() {
        const data = this.view.data
        return data.pending ? {
            pending: true,
        } : {
            pending: false,
            value: this.converter.convertToModel(data.value!),
        }
    }

    get validity(): Validity<ValidationResult> {
        const result = this.view.validity
        if (result.status !== 'validated' || !this.context.valid(result.result!)) {
            return result
        } else {
            try {
                const data = this.data
                return data.pending ? {
                    status: 'unknown',
                } : {
                    status: 'validated',
                    result: this.context.validResult,
                }
            } catch (err) {
                return {
                    status: 'validated',
                    result: (err as ValidationError<ValidationResult>).validationResult,
                }
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
