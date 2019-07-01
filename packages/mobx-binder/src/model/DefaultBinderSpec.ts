import { DefaultBinder } from './DefaultBinder'
import { TextField } from 'mobx-binder-core'
import { expect } from 'chai'
import { EmailValidator, StringValidators } from '..'
import sleep from '../test/sleep'

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
})
