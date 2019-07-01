import { DefaultBinder } from './DefaultBinder'
import { TextField } from 'mobx-binder-core'
import { expect } from 'chai'

describe('DefaultBinder', () => {
    it('should return a DefaultBinder on bind()', () => {
        const myField = new TextField('myField')

        // this assignment could fail if types are wrong
        const binder: DefaultBinder = new DefaultBinder({ t: () => '' }).forField(myField).bind()

        expect(binder).to.be.ok
    })
})
