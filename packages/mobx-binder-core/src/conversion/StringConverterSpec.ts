import { expect } from 'chai'
import { EmptyStringConverter } from './EmptyStringConverter'

describe('EmptyStringConverter', () => {
    describe('with undefined', () => {
        const converter = new EmptyStringConverter(undefined)

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
                expect(converter.convertToPresentation(undefined)).to.equal('')
            })
        })
    })

    describe('with placeholder string', () => {
        const converter = new EmptyStringConverter('EMPTY')

        describe('conversion to model', () => {
            it('should pass through strings', () => {
                expect(converter.convertToModel('bla')).to.equal('bla')
            })
            it('should convert empty string presentation to undefined', () => {
                expect(converter.convertToModel('')).to.equal('EMPTY')
            })
        })

        describe('conversion to presentation', () => {
            it('should pass through strings', () => {
                expect(converter.convertToPresentation('bla')).to.equal('bla')
            })
            it('should convert undefined model to empty string', () => {
                expect(converter.convertToPresentation('EMPTY')).to.equal('')
            })
        })
    })
})
