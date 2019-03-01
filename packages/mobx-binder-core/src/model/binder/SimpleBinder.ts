import { Binder, Context, Validator } from './Binder'

export type ErrorMessage = string | undefined

export type SimpleValidator<T> = Validator<ErrorMessage, T>

export class SimpleContext implements Context<ErrorMessage> {
    public readonly validResult = undefined
    public readonly requiredValidator = (message = 'Please enter a value') => (value: any) => !value ? message : undefined
    public readonly translate = (result: ErrorMessage = '') => result
    public readonly valid = (message: ErrorMessage) => !message
}

export class SimpleBinder extends Binder<ErrorMessage> {
    constructor() {
        super(new SimpleContext())
    }
}
