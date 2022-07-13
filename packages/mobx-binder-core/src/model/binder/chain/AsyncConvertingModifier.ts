import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { Data, Modifier, SyncValueValidationResult, ValidValueValidationResult } from './Modifier'
import { Context } from '../Context'
import { AbstractModifier } from './AbstractModifier'
import { AsyncConverter } from '../../../conversion/Converter'
import { isValidationError, ValidationError } from '../../../conversion/ValidationError'
import { Validity } from '../../../validation/Validity'

type AsyncConversionInfo<ViewType, ModelType, ValidationResult> =
    | KnownConversionInfo<ViewType, ModelType, ValidationResult>
    | PendingConversionInfo<ViewType>
    | InitialConversionInfo

type KnownConversionInfo<ViewType, ModelType, ValidationResult> =
    | KnownValidConversionInfo<ViewType, ModelType>
    | KnownInvalidConversionInfo<ViewType, ValidationResult>

interface KnownValidConversionInfo<ViewType, ModelType> {
    status: 'valid'
    validatedValue: ViewType
    correctedValue: ViewType
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
    private info: AsyncConversionInfo<ViewType, ModelType, ValidationResult> = { status: 'initial' }

    constructor(
        view: Modifier<ValidationResult, any, ViewType>,
        context: Context<ValidationResult>,
        private converter: AsyncConverter<ValidationResult, ViewType, ModelType>,
        private options: { onBlur: boolean },
    ) {
        super(view, context)
        makeObservable<AsyncConvertingModifier<ValidationResult, ViewType, ModelType>, 'info' | 'startNewConversion'>(this, {
            info: observable,
            validity: computed,
            startNewConversion: action,
        })
    }

    get name() {
        const name = this.converter.label || this.converter.constructor.name
        return name && name !== 'Function' ? name : undefined
    }

    get type() {
        return 'async conversion'
    }

    get data(): Data<ModelType> {
        const upstreamData = this.view.data
        if (this.info.status === 'valid' && !upstreamData.pending && this.isAlreadyValidated(this.info, upstreamData.value)) {
            return {
                pending: false,
                value: this.info.modelValue,
            }
        }
        return {
            pending: true,
        }
    }

    get validity(): Validity<ValidationResult> {
        const upstreamValidity = this.view.validity
        const status = this.info.status

        if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result)) {
            return upstreamValidity
        }
        const data = this.view.data
        if (!data.pending && this.isAlreadyValidated(this.info, data.value)) {
            return {
                status: 'validated',
                result: this.info.status === 'valid' ? this.context.validResult : this.info.lastValidationResult,
            }
        }
        return {
            status: status === 'validating' ? 'validating' : 'unknown',
        }
    }

    public toView(modelValue: any): ViewType {
        return this.view.toView(this.converter.convertToPresentation(modelValue))
    }

    public validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        return this.view.validateAsync(blurEvent).then(
            action((upstreamValidity: Validity<ValidationResult>): Validity<ValidationResult> | Promise<Validity<ValidationResult>> => {
                if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result)) {
                    return upstreamValidity
                }
                const upstreamData = this.view.data
                if (!upstreamData.pending && this.isAlreadyValidated(this.info, upstreamData.value)) {
                    return {
                        status: 'validated',
                        result: this.info.status === 'valid' ? this.context.validResult : this.info.lastValidationResult,
                    }
                }
                if (!upstreamData.pending && (!blurEvent || this.options.onBlur)) {
                    return this.startNewConversion(upstreamData.value).then(
                        (result): Validity<ValidationResult> => ({
                            status: 'validated',
                            result,
                        }),
                    )
                }
                return {
                    status: this.info.status === 'validating' ? 'validating' : 'unknown',
                }
            }),
        )
    }

    private async startNewConversion(value: ViewType): Promise<ValidationResult> {
        this.info = {
            status: 'validating',
            validatedValue: value,
        }

        try {
            const modelValue = await this.converter.convertToModel(value)

            runInAction(() => {
                if (this.info.status !== 'initial' && this.view.isEqual(value, this.info.validatedValue)) {
                    this.info = {
                        status: 'valid',
                        validatedValue: value,
                        correctedValue: this.converter.convertToPresentation(modelValue),
                        modelValue,
                    }
                }
            })
            return this.context.validResult
        } catch (err) {
            if (isValidationError<ValidationResult>(err)) {
                runInAction(() => {
                    if (this.info.status !== 'initial' && this.view.isEqual(value, this.info.validatedValue)) {
                        this.info = {
                            status: 'invalid',
                            validatedValue: value,
                            lastValidationResult: (err as ValidationError<ValidationResult>).validationResult,
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

    public isEqual(first: ModelType, second: ModelType): boolean {
        if (this.converter.isEqual) {
            return this.converter.isEqual.call(this.converter, first, second)
        }
        return super.isEqual(first, second)
    }

    private isAlreadyValidated(
        info: AsyncConversionInfo<ViewType, ModelType, ValidationResult>,
        value: ViewType,
    ): info is KnownConversionInfo<ViewType, ModelType, ValidationResult> {
        if (info.status === 'valid') {
            return this.view.isEqual(value, info.validatedValue) || this.view.isEqual(value, info.correctedValue)
        } else if (info.status === 'invalid') {
            return this.view.isEqual(value, info.validatedValue)
        }
        return false
    }
}
