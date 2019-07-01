import { DefaultBinder } from './DefaultBinder'
import { TextField } from 'mobx-binder-core'
import { expect } from 'chai'
import { EmailValidator, StringValidators } from '..'
import sleep from '../test/sleep'
import BinderSamples from '../test/BinderSamples'

describe('DefaultBinder', () => {
    it('should return a DefaultBinder on bind()', () => {
        const myField = new TextField('myField')

        // this assignment could fail if types are wrong
        const binder: DefaultBinder = new DefaultBinder({ t: () => '' })
            .forField(myField)
            .withValidator(StringValidators.maxLength(10))
            .withAsyncValidator(value => sleep(1).then(() => EmailValidator.validate()(value)))
            .bind()

        expect(binder).to.be.ok
    })

    it('should allow setting a custom required validator', () => {
        const myField = new TextField('myField')

        // this assignment could fail if types are wrong
        const binder: DefaultBinder = new DefaultBinder({
            t: BinderSamples.t,
            requiredValidator: () => (value: any) => value === '(empty)' ? { messageKey: 'wrong' } : {},
        })
            .forField(myField).isRequired().bind()

        binder.binding(myField).field.updateValue('(empty)')
        expect(myField.errorMessage).to.equal('wrong()')
    })
})
