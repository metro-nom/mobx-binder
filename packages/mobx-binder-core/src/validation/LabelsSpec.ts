import { expect } from 'chai'
import sinon from 'sinon'
import { isLabeled, withLabel } from './Labels'

const validator = sinon
    .stub()
    .withArgs('test')
    .returns('result')

describe('LabeledValidator', () => {
    it('should still validate as before', () => {
        const wrapper = withLabel('theLabel', validator)

        expect(wrapper('test')).to.equal('result')
    })

    it('should return false when unlabeled', () => {
        expect(isLabeled(validator)).to.be.false
    })

    it('should not alter a validator by itself by labeling it', () => {
        withLabel('theLabel', validator)
        expect(isLabeled(validator)).to.be.false
    })

    it('should provide a property with the label', () => {
        const wrapper = withLabel('theLabel', validator)
        expect(isLabeled(wrapper) && wrapper.label).to.equal('theLabel')
    })

    it('should support async validations', () => {
        const wrapper = withLabel('async', async value => (!value ? 'required' : undefined))
        expect(wrapper('')).to.eventually.equal('required')
        expect(isLabeled(wrapper) && wrapper.label).to.equal('async')
    })

    it('should preserve other attributes of the function', () => {
        const validator: any = (value: string) => (!value ? 'required' : undefined)
        validator.someProp = 'test'
        expect((withLabel('someLabel', validator) as any).someProp).to.equal('test')
    })

    describe('labels with arguments', () => {
        it('should support adding arguments to the label', () => {
            const wrapper = withLabel('theLabel', { minAge: 12 }, validator)

            expect(wrapper('test')).to.equal('result')
            expect(isLabeled(wrapper) && wrapper.label).to.equal('theLabel(minAge=12)')
        })

        it('should not add undefined arguments to the label', () => {
            const wrapper = withLabel('theLabel', { minAge: 12, maxAge: undefined }, validator)

            expect(wrapper('test')).to.equal('result')
            expect(isLabeled(wrapper) && wrapper.label).to.equal('theLabel(minAge=12)')
        })
    })
})
