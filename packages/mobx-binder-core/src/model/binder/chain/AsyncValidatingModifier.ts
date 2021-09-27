import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { Data, InvalidValueValidationResult, Modifier, SyncValueValidationResult, ValidValueValidationResult } from './Modifier'
import { Context } from '../Context'
import { AsyncValidator } from '../../../validation/Validator'
import { AbstractModifier } from './AbstractModifier'
import { Validity } from '../../../validation/Validity'

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
    private info: AsyncValidationInfo<ValueType, ValidationResult> = { status: 'initial' }

    constructor(
        view: Modifier<ValidationResult, any, ValueType>,
        context: Context<ValidationResult>,
        private validator: AsyncValidator<ValidationResult, ValueType>,
        private options: { onBlur: boolean },
    ) {
        super(view, context)

        makeObservable<AsyncValidatingModifier<ValidationResult, ValueType>, 'info' | 'startNewValidation'>(this, {
            info: observable,
            validity: computed,
            startNewValidation: action,
        })
    }

    get type() {
        return 'async validation'
    }

    get data(): Data<ValueType> {
        const data = this.view.data
        if (
            this.info.status === 'validated' &&
            !data.pending &&
            this.view.isEqual(data.value, this.info.validatedValue) &&
            this.context.valid(this.info.lastValidationResult)
        ) {
            return data
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

    public validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        return this.view.validateAsync(blurEvent).then(
            action((upstreamValidity: Validity<ValidationResult>): Validity<ValidationResult> | Promise<Validity<ValidationResult>> => {
                if (upstreamValidity.status !== 'validated' || !this.context.valid(upstreamValidity.result)) {
                    return upstreamValidity
                }
                const upstreamData = this.view.data
                if (!upstreamData.pending && this.info.status === 'validated' && this.view.isEqual(upstreamData.value, this.info.validatedValue)) {
                    return {
                        status: 'validated',
                        result: this.info.lastValidationResult,
                    }
                }
                if (!upstreamData.pending && (!blurEvent || this.options.onBlur)) {
                    return this.startNewValidation(upstreamData.value).then(result => ({
                        status: 'validated',
                        result,
                    }))
                }
                return {
                    status: this.info.status === 'validating' ? 'validating' : 'unknown',
                }
            }),
        )
    }

    private async startNewValidation(value: ValueType): Promise<ValidationResult> {
        this.info = {
            status: 'validating',
            validatedValue: value,
        }

        const result = await this.validator(value)

        runInAction(() => {
            if (this.info.status !== 'initial' && this.view.isEqual(value, this.info.validatedValue)) {
                this.info = {
                    status: 'validated',
                    validatedValue: value,
                    lastValidationResult: result,
                }
            }
        })
        return result
    }

    protected validateValueLocally(viewResult: ValidValueValidationResult<ValueType>): Promise<SyncValueValidationResult<ValueType, ValidationResult>> {
        return this.validator(viewResult.value).then((result: ValidationResult) => {
            return this.context.valid(result) ? viewResult : ({ valid: false, result } as InvalidValueValidationResult<ValidationResult>)
        })
    }
}
