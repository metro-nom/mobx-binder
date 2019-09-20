import { action, computed, observable, runInAction } from 'mobx'
import { Data, Modifier, Validity } from './Modifier'
import { Context } from '../Context'
import { AsyncValidator } from '../../../validation/Validator'
import { AbstractModifier } from './AbstractModifier'

type AsyncValidationInfo<ValueType, ValidationResult> =
    | KnownValidationInfo<ValueType, ValidationResult>
    | PendingValidationInfo<ValueType>
    | InitialValidationInfo

interface KnownValidationInfo<ValueType, ValidationResult> {
    status: 'validated'
    validatedValue: ValueType
    lastValidationResult: ValidationResult
}

interface PendingValidationInfo<ValueType> {
    status: 'validating'
    validatedValue: ValueType
}

interface InitialValidationInfo {
    status: 'initial'
}

export class AsyncValidatingModifier<ValidationResult, ValueType> extends AbstractModifier<ValidationResult, ValueType, ValueType> {
    @observable
    private info: AsyncValidationInfo<ValueType, ValidationResult> = { status: 'initial' }

    constructor(
        view: Modifier<ValidationResult, any, ValueType>,
        context: Context<ValidationResult>,
        private validator: AsyncValidator<ValidationResult, ValueType>,
        private options: { onBlur: boolean },
    ) {
        super(view, context)
    }

    get data(): Data<ValueType> {
        const data = this.view.data
        if (this.info.status === 'validated' && data.value === this.info.validatedValue && this.context.valid(this.info.lastValidationResult)) {
            return data
        }
        return {
            pending: true,
        }
    }

    @computed
    get validity(): Validity<ValidationResult> {
        const upstreamValidity = this.view.validity
        const status = this.info.status

        if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result)) {
            return upstreamValidity
        }
        const data = this.view.data
        if (!data.pending && this.info.status === 'validated' && this.view.isEqual(data.value, this.info.validatedValue)) {
            // TODO equality
            return {
                status: 'validated',
                result: this.info.lastValidationResult,
            }
        }
        return {
            status: status === 'validating' ? 'validating' : 'unknown',
        }
    }

    public async validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        const upstreamValidity = await this.view.validateAsync(blurEvent)
        if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result)) {
            return upstreamValidity
        }
        const upstreamData = this.view.data
        if (!upstreamData.pending && this.info.status === 'validated' && upstreamData.value === this.info.validatedValue) {
            return {
                status: 'validated',
                result: this.info.lastValidationResult,
            }
        }
        if (!upstreamData.pending && (!blurEvent || this.options.onBlur)) {
            const result = await this.startNewValidation(upstreamData.value)
            return {
                status: 'validated',
                result,
            }
        }
        return {
            status: this.info.status === 'validating' ? 'validating' : 'unknown',
        }
    }

    @action
    private async startNewValidation(value: ValueType): Promise<ValidationResult> {
        this.info = {
            status: 'validating',
            validatedValue: value,
        }

        const result = await this.validator(value)

        runInAction(() => {
            if (this.info.status !== 'initial' && value === this.info.validatedValue) {
                this.info = {
                    status: 'validated',
                    validatedValue: value,
                    lastValidationResult: result,
                }
            }
        })
        return result
    }
}
