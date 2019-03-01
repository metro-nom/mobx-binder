import { expect } from 'chai'
import { StringConverter } from './StringConverter'

describe('StringConverter', () => {
    const converter = new StringConverter()

    describe('conversion to model', () => {
        it('should pass through strings', () => {
            expect(converter.convertToModel('bla')).to.equal('bla')
        })
        it('should convert empty string presentation to undefined', () => {
            expect(converter.convertToModel('')).to.be.undefined
        })
    })

    describe('conversion to presentation', () => {
        it('should pass through strings', () => {
            expect(converter.convertToPresentation('bla')).to.equal('bla')
        })
        it('should convert undefined model to empty string', () => {
            expect(converter.convertToPresentation()).to.equal('')
        })
    })
})
