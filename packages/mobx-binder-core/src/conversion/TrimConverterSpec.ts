import { expect } from 'chai'
import { TrimConverter } from './TrimConverter'

describe('TrimConverter', () => {
    const converter = new TrimConverter()

    describe('conversion to model', () => {
        it('should pass through strings without whitespaces', () => {
            expect(converter.convertToModel('bla')).to.equal('bla')
        })
        it('should trim leading and trailing spaces', () => {
            expect(converter.convertToModel(' bla ')).to.equal('bla')
        })
        it('should convert whitespace string presentation to undefined', () => {
            expect(converter.convertToModel('  ')).to.be.undefined
        })
        it('should convert undefined to undefined', () => {
            expect(converter.convertToModel(undefined)).to.be.undefined
        })
    })

    describe('conversion to presentation', () => {
        it('should pass through strings', () => {
            expect(converter.convertToPresentation('bla')).to.equal('bla')
        })
        it('should return undefined presentation for undefined model', () => {
            expect(converter.convertToPresentation()).to.equal(undefined)
        })
    })
})
