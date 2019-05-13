import { FieldStore, TextField } from '../../..'
import { FieldWrapper } from './FieldWrapper'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'

describe('FieldWrapper', () => {
    let field: FieldStore<string>
    let fieldWrapper: FieldWrapper<ErrorMessage, string>

    beforeEach(() => {
        field = new TextField('myField')
        field.updateValue('myValue')

        fieldWrapper = new FieldWrapper(field, new SimpleContext())
    })

    it('should pass through never-pending value of field', () => {
        expect(fieldWrapper.data).to.deep.equal({
            pending: false,
            value: 'myValue',
        })
    })

    it('should be always valid', () => {
        expect(fieldWrapper.validity).to.deep.equal({
            status: 'validated',
            result: undefined,
        })
    })

    it('should return validity as async result', async () => {
        expect(await fieldWrapper.validateAsync()).to.deep.equal({
            status: 'validated',
            result: undefined,
        })
    })

    describe('toView', () => {
        it('should return unchanged model value', () => {
            expect(fieldWrapper.toView('abc')).to.equal('abc')
        })
    })

    it('should not apply anything to field', () => {
        fieldWrapper.applyConversionsToField()
        expect(field.value).to.equal('myValue')
    })
})
