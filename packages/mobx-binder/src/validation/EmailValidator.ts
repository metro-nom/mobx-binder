import * as emailValidator from 'email-validator'
import { BinderValidator } from '../model/DefaultBinder'

export class EmailValidator {
    public static validate(messageKey = 'validations.email'): BinderValidator<string> {
        return (value) => (!!value && !emailValidator.validate(value)) ? { messageKey, args: { value }} : {}
    }
}
