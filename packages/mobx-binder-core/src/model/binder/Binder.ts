import { Converter } from '../../conversion/Converter'
import { action, computed, observable, observe } from 'mobx'
import { StringConverter } from '../../conversion/StringConverter'
import { FieldStore } from '../fields/FieldStore'

// tslint:disable max-classes-per-file

export interface Context<ValidationResult> {
    /**
     * The function used to translate validation results.
     */
    readonly translate: (result: ValidationResult) => string
    /**
     * A function used to check if a validation result means that validation was successful, or not.
     */
    readonly valid: (result: ValidationResult) => boolean

    /**
     * The return value of _validate()_ / _validateAsync_ in case there is no validator configured.
     */
    readonly validResult: ValidationResult

    /**
     * A function that returns a Validator which is added to the validator chain on `.isRequired()`.
     */
    readonly requiredValidator: (messageKey?: string) => Validator<ValidationResult, any>
}

/**
 * Interface to be fulfulled by any validator for use with `withValidator`
 */
export type Validator<ValidationResult, T> = (value?: T) => ValidationResult

/**
 * Interface to be fulfulled by any asynchronous validator for use with `withAsyncValidator`
 */
export type AsyncValidator<ValidationResult, T> = (value?: T) => Promise<ValidationResult>

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
    public submitting: boolean = false

    private bindings: Array<Binding<ValidationResult>> = observable([])

    constructor(public readonly context: Context<ValidationResult>) {
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
    public addBinding(binding: Binding<ValidationResult>) {
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
        const validities = this.bindings.map(binding => binding.field.valid)
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
            .map(binding => !!binding.field.validating)
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
    public validateAsync(): Promise<void> {
        return Promise.all(this.bindings.map(binding => binding.validateAsync()))
            .then(results => {
                if (results.every(result => this.context.valid(result))) {
                    return
                } else {
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
    public submit<TargetType = any>(target: TargetType = {} as any,
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
                        const newPromise = onSuccess(result)

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

interface Modifier<ValidationResult> {
    converter?: Converter<ValidationResult, any, any>
    validator?: Validator<ValidationResult, any>
    asyncValidator?: AsyncValidator<any, any>
    asyncValidateOnBlur?: boolean
    onChange?: (value: any) => any

    lastValidation?: {
        promise?: Promise<any>
        validatedValue?: any
        result?: ValidationResult
    }
}

export class BindingBuilder<ValidationResult, ValueType> {
    private modifiers: Array<Modifier<ValidationResult>> = []
    private readOnly = false
    private required = false

    constructor(private readonly binder: Binder<ValidationResult>,
                private readonly field: FieldStore<ValueType>) {
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
        this.modifiers.push({ converter })
        return this as any
    }

    /**
     * Add a synchronous Validator to the binding chain. Sync validations happen on every value update.
     * @param validator
     */
    public withValidator(validator: Validator<ValidationResult, ValueType>): BindingBuilder<ValidationResult, ValueType> {
        this.modifiers.push({ validator })
        return this
    }

    /**
     * Add an asynchronous validator to the binding chain. Async validations happen on submit and - if configured via the options parameter - also on blur.
     * @param asyncValidator
     * @param options
     */
    public withAsyncValidator(asyncValidator: AsyncValidator<ValidationResult, ValueType>,
                              options: { onBlur: boolean } = { onBlur: false }): BindingBuilder<ValidationResult, ValueType> {
        this.modifiers.push({ asyncValidator, asyncValidateOnBlur: options.onBlur })
        return this
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
        this.modifiers.push({ onChange })
        return this
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
    public bind2<T>(read: (source: T) => ValueType | undefined, write?: (target: T, value?: ValueType) => void) {
        this.field.readOnly = this.readOnly || !write
        this.field.required = this.required

        this.binder.addBinding(new StandardBinding(this.binder.context, this.field, this.modifiers,
            read, this.readOnly ? undefined : write))
        return this.binder
    }
}

interface Node<ValidationResult> {
    valid?: boolean
    value?: any
    validationPromise?: Promise<ValidationResult>
    validationResult?: ValidationResult
}

type Handler<ValidationResult> = (context: Context<ValidationResult>, modifier: Modifier<ValidationResult>, node: Node<ValidationResult>)
    => Node<ValidationResult> | undefined

interface TraversalOptions {
    noInvalid: boolean
}

class StandardBinding<ValidationResult> implements Binding<ValidationResult> {
    @observable
    private unchangedValue?: any

    private ignoreChange = false

    private readonly reverseModifiers: Array<Modifier<ValidationResult>>

    constructor(private readonly context: Context<ValidationResult>,
                public readonly field: FieldStore<any>,
                private readonly modifiers: Array<Modifier<ValidationResult>>,
                private read: (source: any) => any,
                private write?: (target: any, value: any) => void) {

        this.reverseModifiers = [ ...modifiers ].reverse()
        this.validate()
        observe(field, 'value', this.handleChange.bind(this))
        this.addOnBlurValidationInterceptor()
    }

    @computed
    public get changed() {
        return this.field.value !== this.unchangedValue
    }

    @action
    public setUnchanged() {
        this.unchangedValue = this.field.value
        this.field.changed = this.changed
    }

    @action
    public handleChange() {
        if (!this.ignoreChange) {
            const result = this.traverse(this.presentationNode(), [ this.changeHandler ])
            this.field.changed = this.changed
            this.exposeValidationResults(result)
        }
    }

    @action
    public validate(): ValidationResult {
        const result = this.traverse()
        this.exposeValidationResults(result)
        return result.validationResult || this.context.validResult
    }

    @action
    public validateAsync(onBlur = false): Promise<ValidationResult> {
        const node = this.traverse(this.presentationNode(), [ this.asyncValidationHandlerFactory(onBlur) ])
        return node.validationPromise ? node.validationPromise : Promise.resolve(this.context.validResult)
    }

    @action
    public load(source: any): void {
        const value = this.read(source)
        const node: Node<ValidationResult> = { value, valid: true }
        const result = this.traverseBackwards(node)

        this.unchangedValue = result.value
        try {
            this.ignoreChange = true

            this.field.reset(result.value)
            this.validate()
        } finally {
            this.ignoreChange = false
        }
    }

    public store(target: any) {
        if (this.write) {
            const result = this.traverse()
            if (!result.validationResult || this.context.valid(result.validationResult)) {
                this.write(target, result.value)
            }
        }
    }

    private presentationNode() {
        return {
            value: this.field.value,
            valid: true,
        }
    }

    @action
    private exposeValidationResults(node: Node<ValidationResult>) {
        this.field.valid = node.validationResult ?
            this.context.valid(node.validationResult) :
            (node.validationPromise ? undefined : node.valid)
        this.field.errorMessage = this.field.valid === false ? this.context.translate(node.validationResult!) : undefined
    }

    private traverse(node: Node<ValidationResult> = this.presentationNode(), handlers: Array<Handler<ValidationResult>> = [], options?: TraversalOptions) {
        return this.traverseList(node, this.modifiers, [
            ...handlers,
            this.validationHandler,
            this.conversionHandlerFactory(true),
        ], options)
    }

    private traverseBackwards(node: Node<ValidationResult>, handlers: Array<Handler<ValidationResult>> = [], options?: TraversalOptions) {
        return this.traverseList(node, this.reverseModifiers, [
            ...handlers,
            this.conversionHandlerFactory(false),
        ], options)
    }

    private traverseList(node: Node<ValidationResult>,
                         list: Array<Modifier<ValidationResult>>,
                         handlers: Array<Handler<ValidationResult>>,
                         { noInvalid }: TraversalOptions = { noInvalid: false }): Node<ValidationResult> {

        for (const modifier of list) {
            if (noInvalid && node.valid === false) {
                // nothing more to do - skip rest of modifier chain
                break
            }
            if (!noInvalid || node.valid !== false) {
                node = handlers.reduce((prevNode: Node<ValidationResult>, handler: Handler<ValidationResult>) => {
                    const result = handler(this.context, modifier, prevNode)
                    return result || prevNode
                }, node)
            }
        }
        return node
    }

    private conversionHandlerFactory(forward: boolean): Handler<ValidationResult> {
        return (context: Context<ValidationResult>, modifier: Modifier<ValidationResult>, node: Node<ValidationResult>): Node<ValidationResult> => {
            if (node.valid && modifier.converter) {
                try {
                    const value = forward ? modifier.converter.convertToModel(node.value) :
                        modifier.converter.convertToPresentation(node.value)

                    return {
                        ...node,
                        value,
                    }
                } catch (e) {
                    return {
                        ...node,
                        valid: this.context.valid(e.result),
                        validationResult: e.result,
                    }
                }
            }
            return node
        }
    }

    @action
    private validationHandler =
        (context: Context<ValidationResult>, modifier: Modifier<ValidationResult>, node: Node<ValidationResult>): Node<ValidationResult> => {
        if (node.valid) {
            if (modifier.validator) {
                const validationResult = modifier.validator(node.value)
                return {
                    ...node,
                    valid: this.context.valid(validationResult),
                    validationResult,
                }
            } else if (modifier.asyncValidator) {
                if (modifier.lastValidation && modifier.lastValidation.validatedValue === node.value && modifier.lastValidation.result) {
                    return {
                        ...node,
                        valid: this.context.valid(modifier.lastValidation.result),
                        validationResult: modifier.lastValidation.result,
                    }
                } else {
                    return {
                        ...node,
                        valid: undefined,
                        validationResult: undefined,
                    }
                }
            }
        } else { // invalid
            if (modifier.asyncValidator) {
                delete modifier.lastValidation
                this.field.validating = false
            }
        }
        return node
    }

    private changeHandler = (_: Context<ValidationResult>, modifier: Modifier<ValidationResult>, node: Node<ValidationResult>): Node<ValidationResult> => {
        if (node.valid && modifier.onChange) {
            modifier.onChange(node.value)
        }
        return node
    }

    private asyncValidationHandlerFactory = (onBlur: boolean) => {
        return (context: Context<ValidationResult>, modifier: Modifier<ValidationResult>, node: Node<ValidationResult>): Node<ValidationResult> => {
            if (node.valid !== false && modifier.asyncValidator && (!onBlur || modifier.asyncValidateOnBlur)) {
                if (!modifier.lastValidation || (modifier.lastValidation.validatedValue !== node.value)) {
                    return this.startAsyncValidation(modifier, node)
                } else if (modifier.lastValidation && modifier.lastValidation.result) {
                    return {
                        ...node,
                        valid: this.context.valid(modifier.lastValidation.result),
                        validationResult: modifier.lastValidation.result,
                    }
                }
            }
            return node
        }
    }

    @action
    private startAsyncValidation(modifier: Modifier<ValidationResult>, node: Node<ValidationResult>) {
        this.field.validating = true
        modifier.lastValidation = {
            validatedValue: node.value,
            promise: modifier.asyncValidator!(node.value).then(action((validationResult: ValidationResult) => {
                if (modifier.lastValidation && modifier.lastValidation.validatedValue === node.value) {
                    modifier.lastValidation = {
                        validatedValue: node.value,
                        result: validationResult,
                    }
                    this.exposeValidationResults({
                        ...node,
                        valid: this.context.valid(validationResult),
                        validationResult,
                    })
                    this.field.validating = false
                    return validationResult
                }
            })),
        }
        return {
            ...node,
            validationPromise: modifier.lastValidation.promise,
        }
    }

    private addOnBlurValidationInterceptor() {
        const previous = this.field.handleBlur

        this.field.handleBlur = () => {
            this.validateAsync(true).then(() => previous.call(this.field))
        }
    }
}
