import { Converter } from '../../conversion/Converter'
import { action, computed, observable, observe } from 'mobx'
import { StringConverter } from '../../conversion/StringConverter'
import { FieldStore } from '../fields/FieldStore'

// tslint:disable max-classes-per-file

export interface Context<ValidationResult> {
    readonly translate: (result: ValidationResult) => string
    readonly valid: (result: ValidationResult) => boolean
    readonly validResult: ValidationResult
    readonly requiredValidator: (messageKey?: string) => Validator<ValidationResult, any>
}

export type Validator<ValidationResult, T> = (value?: T) => ValidationResult

export type AsyncValidator<ValidationResult, T> = (value?: T) => Promise<ValidationResult>

export interface Binding<ValidationResult> {
    changed: boolean
    readonly field: FieldStore<any>

    load(source: any): void
    store(target: any): void
    validate(): void
    validateAsync(onBlur?: boolean): Promise<ValidationResult>
    setUnchanged(): void
}

export class Binder<ValidationResult> {
    @observable
    public submitting: boolean = false

    private bindings: Array<Binding<ValidationResult>> = observable([])

    constructor(public readonly context: Context<ValidationResult>) {
    }

    public forField<ValueType>(field: FieldStore<ValueType>): BindingBuilder<ValidationResult, ValueType> {
        return new BindingBuilder(this, field)
    }

    public addBinding(binding: Binding<ValidationResult>) {
        this.bindings.push(binding)
    }

    @action
    public removeBinding(field: FieldStore<any>): void {
        const index = this.bindings.findIndex(binding => binding.field === field)
        this.bindings.splice(index, 1)
    }

    public binding(field: FieldStore<any>): Binding<ValidationResult> {
        const result = this.bindings.find(binding => binding.field === field)

        if (!result) {
            throw new Error(`Cannot find binding for ${field.name}`)
        }
        return result
    }

    public clear(): void {
        this.load({})
    }

    @action
    public load(source: any): void {
        this.bindings.forEach(binding => {
            binding.load(source)
        })
    }

    public store<TargetType = any>(target: TargetType = {} as any): TargetType {
        this.bindings.forEach(binding => {
            binding.store(target)
        })
        return target
    }

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

    @computed
    public get validating(): boolean {
        return this.bindings
            .map(binding => !!binding.field.validating)
            .every(validating => validating)
    }

    @computed
    public get changed(): boolean {
        return this.bindings
            .map(binding => !!binding.changed)
            .some(changed => changed)
    }

    @action
    public setUnchanged(): void {
        this.bindings.forEach(binding => {
            binding.setUnchanged()
        })
    }

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

    public withConverter<NextType>(converter: Converter<ValidationResult, ValueType, NextType>): BindingBuilder<ValidationResult, NextType> {
        this.modifiers.push({ converter })
        return this as any
    }

    public withValidator(validator: Validator<ValidationResult, ValueType>): BindingBuilder<ValidationResult, ValueType> {
        this.modifiers.push({ validator })
        return this
    }

    public withAsyncValidator(asyncValidator: AsyncValidator<ValidationResult, ValueType>,
                              options: { onBlur: boolean } = { onBlur: false }): BindingBuilder<ValidationResult, ValueType> {
        this.modifiers.push({ asyncValidator, asyncValidateOnBlur: options.onBlur })
        return this
    }

    public isReadOnly(): BindingBuilder<ValidationResult, ValueType> {
        this.readOnly = true
        return this
    }

    public isRequired(messageKey?: string): BindingBuilder<ValidationResult, ValueType> {
        this.required = true
        return this.withValidator(this.binder.context.requiredValidator(messageKey))
    }

    public onChange(onChange: (value: ValueType) => any): BindingBuilder<ValidationResult, ValueType> {
        this.modifiers.push({ onChange })
        return this
    }

    @action
    public bind(name?: string) {
        const propertyName = name || this.field.name

        return this.bind2(
            (source: any) => source[ propertyName ],
            (target: any, value?: ValueType) => target[ propertyName ] = value)
    }

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

    private reverseModifiers: Array<Modifier<ValidationResult>>

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
    public validate(): void {
        const result = this.traverse()
        this.exposeValidationResults(result)
    }

    @action
    public validateAsync(onBlur = false): Promise<ValidationResult> {
        const node = this.traverse(this.presentationNode(), [ this.asyncValidationHandlerFactory(onBlur) ])
        return node.validationPromise ? node.validationPromise : Promise.resolve(this.context.validResult)
    }

    @action
    public load(source: any) {
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
                    return this.startAsyncValidation(context, modifier, node)
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
    private startAsyncValidation(context: Context<ValidationResult>, modifier: Modifier<ValidationResult>, node: Node<ValidationResult>) {
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
