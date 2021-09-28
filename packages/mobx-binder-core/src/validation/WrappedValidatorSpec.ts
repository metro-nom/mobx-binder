import { expect } from 'chai'
import { isWrapper, wrapRequiredValidator } from './WrappedValidator'
import sinon from 'sinon'
import { isLabeled } from './Labels'

const validator = sinon
    .stub()
    .withArgs('test')
    .returns('result')

describe('WrappedValidator', () => {
    it('should still validate as before', () => {
        const wrapper = wrapRequiredValidator(validator)
        expect(wrapper('test')).to.equal('result')
    })

    it('should provide a method to return the "required" status', () => {
        const wrapper = wrapRequiredValidator(validator, () => true)
        expect(isWrapper(wrapper) && wrapper.required()).to.be.true

        const wrapper2 = wrapRequiredValidator(validator, () => false)
        expect(isWrapper(wrapper2) && wrapper2.required()).to.be.false
    })

    it('should provide a label', () => {
        const wrapper = wrapRequiredValidator(validator, () => true)
        expect(isLabeled(wrapper) && wrapper.label).to.equal('required(value=true)')
    })
})
