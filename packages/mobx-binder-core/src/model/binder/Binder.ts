import { Converter } from '../../conversion/Converter'
import { action, computed, isObservable, observable, toJS, runInAction } from 'mobx'
import { StringConverter } from '../../conversion/StringConverter'
import { FieldStore } from '../fields/FieldStore'
import { Modifier } from './chain/Modifier'
import { FieldWrapper } from './chain/FieldWrapper'
import { ConvertingModifier } from './chain/ConvertingModifier'
import { ValidatingModifier } from './chain/ValidatingModifier'
import { AsyncValidatingModifier } from './chain/AsyncValidatingModifier'
import { ChangeEventHandler } from './chain/ChangeEventHandler'
import { Context } from './Context'
import { AsyncValidator, Validator } from '../../validation/Validator'

// tslint:disable max-classes-per-file

/**
 * API for single field binding
 */
export interface Binding<ValidationResult> {
    changed: boolean
    readonly field: FieldStore<any>

    /**
     * Load the field value from the source object, treating it as "unchanged" value.
     *
     * @param source
     */
    load(source: any): void

    /**
     * Store the valid field value to the target object
     *
     * @param target
     */
    store(target: any): void

    /**
     * Perform synchronous validation
     * @deprecated triggers nothing as validity is pure computed state now
     */
    validate(): ValidationResult

    /**
     * Trigger asynchronous validation. onBlur indicates the current event - the binding then decides if a validation takes place or not
     *
     * @param onBlur
     */
    validateAsync(onBlur?: boolean): Promise<ValidationResult>

    /**
     * Sets the current field value to be handled as not changed.
     */
    setUnchanged(): void
}

export class Binder<ValidationResult> {
    /**
     * Indicates if a #submit() operation is currently in progress. This covers async validations happening on submit and also the `onSuccess` operation.
     */
    @observable
    public submitting?: boolean

    private bindings: Array<StandardBinding<ValidationResult>> = observable([])

    constructor(public readonly context: Context<ValidationResult>) {
        runInAction(() => { this.submitting = false })
    }

    /**
     * `BindingBuilder` creation for adding a new field binding.
     *
     * @param field
     */
    public forField<ValueType>(field: FieldStore<ValueType>): BindingBuilder<ValidationResult, ValueType> {
        return new BindingBuilder(this, field)
    }

    /**
     * Used by the `BindingBuilder` after preparing a new field.
     * @param binding
     */
    @action
    public addBinding(binding: StandardBinding<ValidationResult>) {
        this.bindings.push(binding)
    }

    /**
     * Here you can remove existing bindings. This re-evaluates the global form validation status.
     * This way you can conditionally add/remove "hidden" fields that are only visible under certain conditions.
     *
     * @param field
     */
    @action
    public removeBinding(field: FieldStore<any>): void {
        const index = this.bindings.findIndex(binding => binding.field === field)
        this.bindings.splice(index, 1)
    }

    /**
     * Provides access to a single field `Binding`.
     * @param field
     */
    public binding(field: FieldStore<any>): Binding<ValidationResult> {
        const result = this.bindings.find(binding => binding.field === field)

        if (!result) {
            throw new Error(`Cannot find binding for ${field.name}`)
        }
        return result
    }

    /**
     * Same as `load({})`
     */
    public clear(): void {
        this.load({})
    }

    /**
     * Loads the values from the given backend object, treating them as "unchanged" values.
     *
     * @param source
     */
    @action
    public load(source: any): void {
        this.bindings.forEach(binding => {
            binding.load(source)
        })
    }

    /**
     * Stores converted valid field values to to the given backend object.
     *
     * @param target
     */
    public store<TargetType = any>(target: TargetType = {} as any): TargetType {
        this.bindings.forEach(binding => {
            binding.store(target)
        })
        return target
    }

    /**
     * The global form validation status.
     * - `true`: all async validations are done and all fields are valid
     * - `false`: any sync or async validation failed
     * - `undefined`: all sync validations are successfull, async validations are not yet performed
     */
    @computed
    public get valid(): boolean | undefined {
        const validities = this.bindings.map(binding => binding.valid)
        if (validities.every((validity: boolean | undefined) => validity === true)) {
            return true
        } else if (validities.some((validity: boolean | undefined) => validity === false)) {
            return false
        }
        return undefined
    }

    /**
     * Indicates whether any async validation is currently in progress.
     */
    @computed
    public get validating(): boolean {
        return this.bindings
            .map(binding => !!binding.validating)
            .every(validating => validating)
    }

    /**
     * Indicates if any field has a changed value.
     */
    @computed
    public get changed(): boolean {
        return this.bindings
            .map(binding => binding.changed)
            .some(changed => changed)
    }

    /**
     * Sets all fields with current values to be not changed.
     */
    @action
    public setUnchanged(): void {
        this.bindings.forEach(binding => {
            binding.setUnchanged()
        })
    }

    /**
     * Actively trigger async validation / wait for still ongoing validations.
     * Please note that async validation results for a value might be cached.
     */
    public async validateAsync(): Promise<void> {
        await Promise.all(this.bindings.map(binding => binding.validateAsync()))
            .then(results => {
                if (!results.every(result => this.context.valid(result))) {
                    throw new Error()
                }
            })
    }

    /**
     * "Submit" the form. Performs an async validation and if successful,
     * executes the `onSuccess` callback with the field values stored into the `target` object.
     * During validation/onSuccess, the `submitting` property is set to true.
     * If validation failed, `showValidationResults()` is called and the function rejects with an "empty" Error (without a message).
     * In case of another error, like `onSubmit()` rejection, the error is propagated as is.
     *
     * @param target
     * @param onSuccess
     */
    @action
    public submit<TargetType = any>(target: Partial<TargetType> = {},
                                    onSuccess?: (target: TargetType) => Promise<TargetType> | void | undefined): Promise<TargetType> {
        let promise: Promise<any> = Promise.resolve()
        this.submitting = true
        if (this.valid !== false) {
            promise = promise
                .then(() => this.validateAsync())
                .catch(err => {
                    this.showValidationResults()
                    throw err
                })
                .then(action(() => {
                    const result = this.store(target)
                    if (onSuccess) {
                        const newPromise = onSuccess(result as TargetType)

                        if (newPromise && newPromise.then) {
                            return newPromise.then(() => result)
                        }
                    }
                    return result
                }))
        } else {
            this.showValidationResults()
            const error = new Error() // message empty as it's no global/submission error
            promise = Promise.reject(error)
        }
        return promise.then(
            action((x: any) => {
                this.submitting = false
                return x
            }),
            action(err => {
                this.submitting = false
                throw err
            }))
    }

    /**
     * Shows validation results on all fields.
     */
    @action
    public showValidationResults(): void {
        this.bindings.forEach(binding => {
            binding.field.showValidationResults = true
        })
    }

}

export class BindingBuilder<ValidationResult, ValueType> {
    private readOnly = false
    private required = false

    constructor(private readonly binder: Binder<ValidationResult>,
                private readonly field: FieldStore<ValueType>,
                private last: Modifier<ValidationResult, any, any> = new FieldWrapper(field, binder.context)) {
        if (this.field.valueType === 'string') {
            this.withConverter(new StringConverter() as any)
        }
    }

    /**
     * Add a Converter to the binding chain. Validations added after a conversion have to match with the converted type.
     *
     * @param converter
     */
    public withConverter<NextType>(converter: Converter<ValidationResult, ValueType, NextType>): BindingBuilder<ValidationResult, NextType> {
        return this.addModifier<NextType>(new ConvertingModifier(this.last, this.binder.context, converter))
    }

    /**
     * Add a synchronous Validator to the binding chain. Sync validations happen on every value update.
     * @param validator
     */
    public withValidator(validator: Validator<ValidationResult, ValueType>): BindingBuilder<ValidationResult, ValueType> {
        return this.addModifier<ValueType>(new ValidatingModifier(this.last, this.binder.context, validator))
    }

    /**
     * Add an asynchronous validator to the binding chain. Async validations happen on submit and - if configured via the options parameter - also on blur.
     * @param asyncValidator
     * @param options
     */
    @action
    public withAsyncValidator(asyncValidator: AsyncValidator<ValidationResult, ValueType>,
                              options: { onBlur: boolean } = { onBlur: false }): BindingBuilder<ValidationResult, ValueType> {
        return this.addModifier<ValueType>(new AsyncValidatingModifier(this.last, this.binder.context, asyncValidator, options))
    }

    /**
     * Mark the field as read-only.
     */
    public isReadOnly(): BindingBuilder<ValidationResult, ValueType> {
        this.readOnly = true
        return this
    }

    /**
     * Add a "required" validator and mark the field as required.
     * @param messageKey
     */
    public isRequired(messageKey?: string): BindingBuilder<ValidationResult, ValueType> {
        this.required = true
        return this.withValidator(this.binder.context.requiredValidator(messageKey))
    }

    /**
     * Add a value change event handler to the chain - it's only called if previous validations succeed.
     * @param onChange
     */
    public onChange(onChange: (value: ValueType) => any): BindingBuilder<ValidationResult, ValueType> {
        return this.addModifier(new ChangeEventHandler(this.last, this.binder.context, onChange))
    }

    /**
     * Finally bind/map the field to a backend object via a simple property named like the field name.
     * @param name
     */
    @action
    public bind(name?: string) {
        const propertyName = name || this.field.name

        return this.bind2(
            (source: any) => source[ propertyName ],
            (target: any, value?: ValueType) => target[ propertyName ] = value)
    }

    /**
     * Finally bind the field to a backend object, using the given read/write functions for loading and storing. If the write method is omitted, the field is
     * marked as read-only.
     *
     * @param read
     * @param write
     */
    @action
    public bind2<T>(read: (source: T) => ValueType | undefined, write?: (target: T, value?: ValueType) => void) {
        this.field.readOnly = this.readOnly || !write
        this.field.required = this.required

        this.binder.addBinding(new StandardBinding(this.binder.context, this.field, this.last,
            read, this.readOnly ? undefined : write))
        return this.binder
    }

    private addModifier<NextType>(modifier: Modifier<ValidationResult, ValueType, NextType>): BindingBuilder<ValidationResult, NextType> {
        this.last = modifier
        return this as any
    }
}

class StandardBinding<ValidationResult> implements Binding<ValidationResult> {
    @observable
    private unchangedValue?: any

    constructor(private readonly context: Context<ValidationResult>,
                public readonly field: FieldStore<any>,
                private readonly chain: Modifier<ValidationResult, any, any>,
                private read: (source: any) => any,
                private write?: (target: any, value: any) => void) {

        this.setUnchanged()
        this.observeField()
        this.addOnBlurValidationInterceptor()
    }

    @computed
    public get changed() {
        if (isObservable(this.field.value)) {
            return JSON.stringify(toJS(this.field.value)) !== JSON.stringify(this.unchangedValue)
        }

        return this.field.value !== this.unchangedValue
    }

    @computed
    get validating() {
        return this.validity.status === 'validating'
    }

    @computed
    get model() {
        return this.chain.data
    }

    @computed
    get validity() {
        const validity = this.chain.validity
        return validity
    }

    @computed
    public get valid() {
        return this.validity.status === 'validated' ? this.context.valid(this.validity.result!) : undefined
    }

    @computed
    get errorMessage() {
        return this.valid === false ? this.context.translate(this.validity.result!) : undefined
    }

    @action
    public setUnchanged() {
        const fieldValue = this.field.value
        this.unchangedValue = isObservable(fieldValue) ? toJS(fieldValue) : fieldValue
    }

    public validate(): ValidationResult {
        return this.validity.status === 'validated' ? this.validity.result! : this.context.validResult
    }

    @action
    public async validateAsync(onBlur = false): Promise<ValidationResult> {
        await this.chain.validateAsync(onBlur)
        const validity = this.validity
        const result = validity.status !== 'validated' ? this.context.validResult : validity.result!
        return result
    }

    @action
    public load(source: any): void {
        const value = this.read(source)
        const viewValue = this.chain.toView(value)
        this.field.reset(viewValue)
        this.setUnchanged()
    }

    public store(target: any) {
        if (this.write) {
            if (this.valid && !this.model.pending) {
                this.write(target, this.model.value)
            }
        }
    }

    private addOnBlurValidationInterceptor() {
        const previous = this.field.handleBlur

        this.field.handleBlur = async () => {
            await this.validateAsync(true)
            this.chain.applyConversionsToField()
            previous.call(this.field)
        }
    }

    private observeField() {
        Object.defineProperty(this.field, 'valid', { get: () => this.valid })
        Object.defineProperty(this.field, 'validating', { get: () => this.validating })
        Object.defineProperty(this.field, 'errorMessage', { get: () => this.errorMessage })
        Object.defineProperty(this.field, 'changed', { get: () => this.changed })
    }
}
