import { expect } from 'chai'
import { DayjsConverter } from './DayjsConverter'
import dayjs from 'dayjs'

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('DayjsConverter', () => {
    let converter = new DayjsConverter('DD.MM.YYYY', undefined, true)

    describe('conversion to model', () => {
        it('should convert string presentation to Dayjs', () => {
            expect(converter.convertToModel('23.10.2017')!.format('YYYY-MM-DD')).to.equal('2017-10-23')
        })
        it('should convert empty string presentation to undefined', () => {
            expect(converter.convertToModel('')).to.be.undefined
        })
        it('should undefined presentation to undefined', () => {
            expect(converter.convertToModel(undefined)).to.be.undefined
        })

        describe('errors', () => {
            it('should fail with standard message if conversion fails', () => {
                expect(() => converter.convertToModel('abcde'))
                    .to.throw(Error)
                    .with.property('validationResult')
                    .deep.equals({
                        messageKey: 'conversions.error.dayjs',
                        args: { value: 'abcde' },
                    })
            })
            it('should fail with configured message if conversion fails', () => {
                converter = new DayjsConverter('DD.MM.YYYY', undefined, undefined, 'other.key')

                expect(() => converter.convertToModel('abcde'))
                    .to.throw(Error)
                    .with.property('validationResult')
                    .deep.equals({
                        messageKey: 'other.key',
                        args: { value: 'abcde' },
                    })
            })
        })
    })

    describe('conversion to presentation', () => {
        it('should convert model to string presentation', () => {
            expect(converter.convertToPresentation(dayjs('2017-10-23'))).to.equal('23.10.2017')
        })
        it('should convert undefined model to empty string', () => {
            expect(converter.convertToPresentation()).to.equal('')
        })
    })

    describe('isEqual', () => {
        it('should be able to check dayjs for equality', () => {
            expect(converter.isEqual(dayjs('2017-10-23'), dayjs('2017-10-23'))).to.be.true
            expect(converter.isEqual(dayjs('2017-10-23'), dayjs('2017-10-24'))).to.be.false
        })
    })
})
