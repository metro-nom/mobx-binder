import { action, computed, observable, runInAction } from 'mobx'
import { Data, Modifier, SyncValueValidationResult, Validity, ValidValueValidationResult } from './Modifier'
import { Context } from '../Context'
import { AbstractModifier } from './AbstractModifier'
import { AsyncConverter } from '../../../conversion/Converter'
import { isValidationError } from '../../../conversion/ValidationError'

type AsyncConversionInfo<ViewType, ModelType, ValidationResult> =
    | KnownValidConversionInfo<ViewType, ModelType>
    | KnownInvalidConversionInfo<ViewType, ValidationResult>
    | PendingConversionInfo<ViewType>
    | InitialConversionInfo

interface KnownValidConversionInfo<ViewType, ModelType> {
    status: 'valid'
    validatedValue: ViewType
    modelValue: ModelType
}

interface KnownInvalidConversionInfo<ViewType, ValidationResult> {
    status: 'invalid'
    validatedValue: ViewType
    lastValidationResult: ValidationResult
}

interface PendingConversionInfo<ValueType> {
    status: 'validating'
    validatedValue: ValueType
}

interface InitialConversionInfo {
    status: 'initial'
}

export class AsyncConvertingModifier<ValidationResult, ViewType, ModelType> extends AbstractModifier<ValidationResult, ViewType, ModelType> {
    @observable
    private info: AsyncConversionInfo<ViewType, ModelType, ValidationResult> = { status: 'initial' }

    constructor(
        view: Modifier<ValidationResult, any, ViewType>,
        context: Context<ValidationResult>,
        private converter: AsyncConverter<ValidationResult, ViewType, ModelType>,
        private options: { onBlur: boolean },
    ) {
        super(view, context)
    }

    get data(): Data<ModelType> {
        const data = this.view.data
        if (this.info.status === 'valid' && data.value === this.info.validatedValue) {
            return {
                pending: false,
                value: this.info.modelValue,
            }
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
        if (!data.pending && (this.info.status === 'valid' || this.info.status === 'invalid') && this.view.isEqual(data.value, this.info.validatedValue)) {
            return {
                status: 'validated',
                result: this.info.status === 'valid' ? this.context.validResult : this.info.lastValidationResult,
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
        if (!upstreamData.pending && (this.info.status === 'valid' || this.info.status === 'invalid') && upstreamData.value === this.info.validatedValue) {
            return {
                status: 'validated',
                result: this.info.status === 'valid' ? this.context.validResult : this.info.lastValidationResult,
            }
        }
        if (!upstreamData.pending && (!blurEvent || this.options.onBlur)) {
            const result = await this.startNewConversion(upstreamData.value)
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
    private async startNewConversion(value: ViewType): Promise<ValidationResult> {
        this.info = {
            status: 'validating',
            validatedValue: value,
        }

        try {
            const result = await this.converter.convertToModel(value)

            runInAction(() => {
                if (this.info.status !== 'initial' && value === this.info.validatedValue) {
                    this.info = {
                        status: 'valid',
                        validatedValue: value,
                        modelValue: result,
                    }
                }
            })
            return this.context.validResult
        } catch (err) {
            if (isValidationError<ValidationResult>(err)) {
                runInAction(() => {
                    if (this.info.status !== 'initial' && value === this.info.validatedValue) {
                        this.info = {
                            status: 'invalid',
                            validatedValue: value,
                            lastValidationResult: err.validationResult,
                        }
                    }
                })
                return err.validationResult
            }
            throw err
        }
    }

    protected async validateValueLocally(viewResult: ValidValueValidationResult<ViewType>): Promise<SyncValueValidationResult<ModelType, ValidationResult>> {
        try {
            return {
                valid: true,
                value: await this.converter.convertToModel(viewResult.value),
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
