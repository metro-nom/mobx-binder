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

    describe('validateValue', () => {
        it('should always return the given value of the right type as valid field value', () => {
            expect(fieldWrapper.validateValue('123')).to.deep.equal({
                valid: true,
                value: '123',
            })
        })
    })

    it('should not apply anything to field', () => {
        fieldWrapper.applyConversionsToField()
        expect(field.value).to.equal('myValue')
    })

    it('should provide a simple equality check working for simple types like strings and boolean', () => {
        expect(fieldWrapper.isEqual('a', 'a')).to.be.true
        expect(fieldWrapper.isEqual('a', 'b')).to.be.false
    })
})
