import emailValidator from 'email-validator'
import { BinderValidator } from './Validation'
import { withLabel } from 'mobx-binder-core'

export class EmailValidator {
    public static validate(messageKey = 'validations.email'): BinderValidator<string> {
        return withLabel('email', value => (!!value && !emailValidator.validate(value) ? { messageKey, args: { value } } : {}))
    }
}
