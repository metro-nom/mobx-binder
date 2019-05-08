import { expect } from 'chai'
import { MomentConverter } from './MomentConverter'
import * as moment from 'moment'
import { ValidationError } from 'mobx-binder'

describe('MomentConverter', () => {
    let converter = new MomentConverter('DD.MM.YYYY')

    describe('conversion to model', () => {
        it('should convert string presentation to moment', () => {
            expect(converter.convertToModel('23.10.2017')!.format('YYYY-MM-DD')).to.equal('2017-10-23')
        })
        it('should convert empty string presentation to undefined', () => {
            expect(converter.convertToModel('')).to.be.undefined
        })

        describe('errors', () => {
            it('should fail with standard message if conversion fails', () => {
                expect(() => converter.convertToModel('abcde'))
                    .to.throw(ValidationError)
                    .with.property('result').deep.equals(
                    {
                        messageKey: 'conversions.error.moment',
                        args: { value: 'abcde' },
                    })
            })
            it('should fail with configured message if conversion fails', () => {
                converter = new MomentConverter('DD.MM.YYYY', 'other.key')

                expect(() => converter.convertToModel('abcde'))
                    .to.throw(ValidationError)
                    .with.property('result').deep.equals(
                    {
                        messageKey: 'other.key',
                        args: { value: 'abcde' },
                    })
            })
        })
    })

    describe('conversion to presentation', () => {
        it('should convert model to string presentation', () => {
            expect(converter.convertToPresentation(moment('2017-10-23'))).to.equal('23.10.2017')
        })
        it('should convert undefined model to empty string', () => {
            expect(converter.convertToPresentation()).to.equal('')
        })
    })
})
