import { Data, Modifier, ValidValueValidationResult, ValueValidationResult } from './Modifier'
import { Converter } from '../../../conversion/Converter'
import { Context } from '../Context'
import { AbstractModifier } from './AbstractModifier'
import { isValidationError } from '../../../conversion/ValidationError'
import { Validity } from '../../../validation/Validity'
import { action, makeObservable } from 'mobx'

export class ConvertingModifier<ValidationResult, ViewType, ModelType> extends AbstractModifier<ValidationResult, ViewType, ModelType> {
    constructor(
        view: Modifier<ValidationResult, any, ViewType>,
        context: Context<ValidationResult>,
        private converter: Converter<ValidationResult, ViewType, ModelType>,
    ) {
        super(view, context)
        makeObservable<ConvertingModifier<ValidationResult, ViewType, ModelType>, 'calculateValidity'>(this, {
            calculateValidity: action,
        })
    }

    get name() {
        const name = this.converter.label || this.converter.constructor.name
        return name && name !== 'Function' ? name : undefined
    }

    get type() {
        return 'conversion'
    }

    get data(): Data<ModelType> {
        const data = this.view.data
        if (data.pending) {
            return { pending: true }
        }
        try {
            const value = this.converter.convertToModel(data.value)
            return {
                pending: false,
                value,
            }
        } catch (err) {
            if (isValidationError(err)) {
                return { pending: true }
            }
            throw err
        }
    }

    get validity(): Validity<ValidationResult> {
        const result = this.view.validity
        return this.calculateValidity(result)
    }

    public toView(modelValue: any): ViewType {
        return this.view.toView(this.converter.convertToPresentation(modelValue))
    }

    public async validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        return this.calculateValidity(await this.view.validateAsync(blurEvent))
    }

    public isEqual(first: ModelType, second: ModelType): boolean {
        if (this.converter.isEqual) {
            return this.converter.isEqual.call(this.converter, first, second)
        }
        return super.isEqual(first, second)
    }

    private calculateValidity(upstreamValidity: Validity<ValidationResult>): Validity<ValidationResult> {
        if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result)) {
            return upstreamValidity
        } else {
            const upstreamData = this.view.data
            if (upstreamData.pending) {
                return { status: 'unknown' }
            }
            try {
                this.converter.convertToModel(upstreamData.value)
                return {
                    status: 'validated',
                    result: this.context.validResult,
                }
            } catch (err) {
                if (isValidationError<ValidationResult>(err)) {
                    return {
                        status: 'validated',
                        result: err.validationResult,
                    }
                }
                throw err
            }
        }
    }

    protected validateValueLocally(viewResult: ValidValueValidationResult<ViewType>): ValueValidationResult<ModelType, ValidationResult> {
        try {
            const modelValue = this.converter.convertToModel(viewResult.value)
            return {
                valid: true,
                value: modelValue,
            }
        } catch (err) {
            if (isValidationError<ValidationResult>(err)) {
                return {
                    valid: false,
                    result: err.validationResult,
                }
            }
            throw err
        }
    }
}
