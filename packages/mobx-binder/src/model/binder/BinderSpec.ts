import { expect } from 'chai'
import { FieldStore } from '../fields/FieldStore'
import { TextField } from '../fields/TextField'
import { Binder } from './Binder'
import * as moment from 'moment'
import * as sinon from 'sinon'
import BinderSamples from '../../test/BinderSamples'
import { DefaultBinder } from '../DefaultBinder'
import { StringValidators } from '../../validation/StringValidators'
import sleep from '../../test/sleep'
import { MomentConverter } from '../../converter/MomentConverter'
import { MomentValidators } from '../../validation/MomentValidators'

describe('Binder', () => {
    const sandbox = sinon.createSandbox()
    const context = BinderSamples.context()

    let myField: FieldStore<string>
    let secondField: FieldStore<string>
    let clock: sinon.SinonFakeTimers

    beforeEach(() => {
        myField = new TextField('myField')
        secondField = new TextField('secondField')
        clock = sandbox.useFakeTimers()
        clock.setSystemTime(moment('2018-01-25').toDate().getTime())
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('binding', () => {
        it('should provide access to a binding by field', () => {
            const binder = new Binder(context).forField(myField).bind()

            expect(binder.binding(myField).validate).to.be.a('function')
        })

        it('should fail with error on unbound field', () => {
            const binder = new Binder(context)

            expect(() => binder.binding(myField)).to.throw(Error, 'Cannot find binding for myField')
        })

        describe('load', () => {
            it('should clear form (load from empty field)', () => {
                const binder = new Binder(context).forField(myField).bind()
                myField.value = '12345'
                binder.clear()
                expect(myField.value).to.equal('')
            })

            it('should load from bound target property named after the field', () => {
                const binder = new Binder(context).forField(myField).bind()
                binder.load({ myField: 'value' })
                expect(myField.value).to.equal('value')
            })

            it('should allow loading from custom target property', () => {
                const binder = new Binder(context).forField(myField).bind('someKey')
                binder.load({ someKey: 'value' })
                expect(myField.value).to.equal('value')
            })

            it('should allow loading via custom read function', () => {
                const binder = new Binder(context).forField(myField).bind2((source: any) => source.someKey)
                binder.load({ someKey: 'value' })
                expect(myField.value).to.equal('value')
            })
        })

        describe('store', () => {
            it('should store to bound target property named after the field, updating the given target object', () => {
                const binder = new Binder(context).forField(myField).bind()
                const target = { previous: 'value' }
                myField.updateValue('changedValue')

                const returnedTarget = binder.store(target)

                expect(target).to.deep.equal({
                    previous: 'value',
                    myField: 'changedValue'
                })
                expect(returnedTarget).to.equal(target)
            })

            it('should store to new empty object if none is given', () => {
                const binder = new Binder(context).forField(myField).bind()
                myField.updateValue('changedValue')

                const returnedTarget = binder.store()

                expect(returnedTarget).to.deep.equal({ myField: 'changedValue' })
            })

            it('should allow storing to custom target property', () => {
                const binder = new Binder(context).forField(myField).bind('someKey')
                myField.updateValue('changedValue')

                expect(binder.store()).to.deep.equal({ someKey: 'changedValue' })
            })

            it('should allow storing via custom write function', () => {
                const binder = new Binder(context).forField(myField).bind2(
                    () => '',
                    (target: any, value?: string) => target.someKey = value)

                myField.updateValue('changedValue')

                expect(binder.store()).to.deep.equal({ someKey: 'changedValue' })
            })

            it('should mark field as readonly if no storage function is given', () => {
                new Binder(context).forField(myField).bind2(() => '')

                expect(myField.readOnly).to.be.true
            })

            it('should allow marking a field as readonly', () => {
                new Binder(context).forField(myField).isReadOnly().bind()
                expect(myField.readOnly).to.be.true
            })

            it('should not store readonly fields', () => {
                const binder = new Binder(context).forField(myField).isReadOnly().bind()
                myField.value = '12345'

                expect(binder.store()).to.deep.equal({})
            })
        })
    })

    describe('validation', () => {
        let binder: DefaultBinder

        beforeEach(() => {
            binder = new Binder(context)
                .forField(myField).isRequired().withValidator(StringValidators.lengths(5, 10)).bind()
        })

        it('should expose the initial validity of a field during binding', () => {
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.be.ok
        })

        it('should mark fields without validators as valid', () => {
            binder = new Binder(context).forField(myField).bind()

            expect(myField.valid).to.be.true
            expect(myField.errorMessage).to.be.undefined
        })

        it('should update of single field when loaded', () => {
            expect(myField.valid).to.be.false
            binder.binding(myField).load({ myField: 'valid' })
            expect(myField.valid).to.be.true
        })

        it('should update Binder validity when single field is loaded', () => {
            expect(binder.valid).to.be.false
            binder.binding(myField).load({ myField: 'valid' })
            expect(binder.valid).to.be.true
        })

        it('should update the validity of a field on value change', () => {
            myField.value = '12345'
            expect(myField.valid).to.be.true
            expect(myField.errorMessage).to.be.undefined
        })

        it('should add required validation via special isRequired()', () => {
            expect(myField.errorMessage).to.equal('validations.required()')
        })

        it('should mark field as required on isRequired()', () => {
            expect(myField.required).to.be.true
        })

        it('should expose second validation if first is failing', () => {
            myField.value = '123'
            expect(myField.errorMessage).to.equal('validations.lengths(value=123,min=5,max=10)')
        })

        it('should not store invalid values', () => {
            expect(binder.store()).to.deep.equal({})
        })

        it('should provide global validation status for submit button', () => {
            expect(binder.valid).to.be.false
        })
    })

    describe('async validation', () => {
        let binder: DefaultBinder
        let validator: any

        beforeEach(() => {
            validator = sandbox.stub().resolves({})
            binder = new Binder(context)
                .forField(myField).isRequired().withAsyncValidator(validator).bind()
        })

        it('should initially be valid == false because of sync validation', () => {
            expect(myField.valid).to.be.false
        })

        it('should initially be valid == undefined when there are no sync validators at all', () => {
            binder = new Binder(context).forField(myField).withAsyncValidator(validator).bind()
            expect(myField.valid).to.be.undefined
        })

        it('should not trigger asynchronous validators on change or blur by default', () => {
            myField.value = '12345'
            myField.handleBlur()

            expect(validator).to.not.have.been.called
        })

        it('should trigger asynchronous validators on submit', () => {
            myField.value = '12345'

            return binder.submit().then(() => {
                expect(validator).to.have.been.calledWith('12345')
            })
        })

        it('should expose asynchronous validation results during submit', () => {
            validator.resolves({ messageKey: 'my async error' })
            myField.value = '12345'

            return binder.submit().should.be.rejected.then(() => {
                expect(myField.valid).to.be.false
                expect(myField.errorMessage).to.equal('my async error()')
            })
        })

        it('should not call submission function if asynchronous validations fail', () => {
            let called = false
            validator.resolves({ messageKey: 'my async error' })
            myField.value = '12345'

            return binder.submit({}, () => {
                called = true
            }).should.be.rejected.then(() => {
                expect(called).to.be.false
            })
        })

        it('should return promise that resolves with stored values, even if onSubmit returns something else', () => {
            validator.resolves({})
            myField.value = '12345'

            return binder.submit({} as any, () => {
                return Promise.resolve('bla')
            }).then((values: any) => {
                expect(values).to.deep.equal({ myField: '12345' })
            })
        })

        it('should trigger asynchronous validators on blur if configured', () => {
            binder = new Binder(context)
                .forField(myField).isRequired().withAsyncValidator(validator, { onBlur: true }).bind()

            myField.value = '12345'
            myField.handleBlur()

            expect(validator).to.have.been.calledWith('12345')
        })

        it('should respect synchronous validations before asynchronous validators', () => {
            binder = new Binder(context)
                .forField(myField).isRequired().withAsyncValidator(validator, { onBlur: true }).bind()

            myField.value = ''
            myField.handleBlur()

            expect(binder.valid).to.be.false
            expect(validator).to.not.have.been.called
        })

        it('should respect synchronous validations during ongoing asynchronous validators', () => {
            validator = sandbox.spy((_: any, value: string) => new Promise(resolve => {
                setTimeout(() => {
                    value !== '' ? resolve({}) : resolve({ messageKey: 'required' })
                }, 20)
            }))

            myField.value = 'validValue'

            binder = new Binder(context)
                .forField(myField).isRequired().withAsyncValidator(validator, { onBlur: true }).bind()
            expect(validator).to.not.have.been.called

            myField.handleBlur()

            // during async validation
            clock.tick(10)
            expect(binder.valid).to.be.undefined
            expect(myField.validating).to.be.true
            expect(myField.valid).to.be.undefined
            expect(validator).to.have.been.calledOnce

            // after change and synchronous error
            myField.value = ''
            expect(binder.valid).to.be.false
            expect(myField.validating).to.be.false
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('validations.required()')

            // there shoul
            clock.tick(15)
            expect(myField.validating).to.be.false
            expect(binder.valid).to.be.false
            expect(myField.valid).to.be.false

            clock.tick(10)
            expect(binder.valid).to.be.false
            expect(myField.valid).to.be.false
            expect(validator).to.have.been.calledOnce
        })

        it('should toggle validating property during asynchronous validation', () => {
            binder = new Binder(context)
                .forField(myField).isRequired().withAsyncValidator(() => {
                    expect(myField.validating).to.be.true
                    return Promise.resolve({})
                }, { onBlur: true }).bind()

            myField.value = '12345'
            myField.handleBlur()
            return binder.validateAsync().then(() => {
                expect(myField.validating).to.be.false
            })
        })

        it('should not revalidate if value didn\'t change', () => {
            binder = new Binder(context)
                .forField(myField).isRequired().withAsyncValidator(validator, { onBlur: true }).bind()

            myField.value = '12345'
            return binder.validateAsync()
                .then(() => binder.validateAsync())
                .then(() => {
                    expect(validator).to.have.been.calledOnce
                })
        })

        it('should not show success if asynchronous validation has not been done for that value', () => {
            binder = new Binder(context)
                .forField(myField)
                .isRequired()
                .withAsyncValidator(() => {
                    return sleep(1000).then(() => ({ messageKey: 'fail' }))
                }, { onBlur: true }).bind()

            myField.value = '12345'
            const promise = binder.validateAsync()
            clock.tick(2000)
            return promise.should.be.rejected.then(() => {
                myField.updateValue('123456')
                expect(myField.valid).to.be.undefined
            })
        })
    })

    describe('global validity', () => {
        let binder: DefaultBinder
        let validator: any

        beforeEach(() => {
            validator = sandbox.stub().resolves({})
            binder = new Binder(context)
                .forField(myField).isRequired().withAsyncValidator(validator).bind()
                .forField(secondField).isRequired().bind()
        })

        it('should be valid if no fields are registered', () => {
            expect(new Binder(context).valid).to.be.true
        })

        it('should be globally valid if all fields are valid', async () => {
            myField.value = 'valid'
            secondField.value = 'valid'
            await binder.validateAsync()

            expect(binder.valid).to.be.true
        })

        it('should be globally invalid if any fields is invalid', async () => {
            myField.value = ''
            secondField.value = 'valid'

            expect(binder.valid).to.be.false
        })

        it('should be undefined if asynchronous validations did not yet start/complete', async () => {
            myField.value = 'synchronously valid'
            secondField.value = 'valid'

            expect(binder.valid).to.be.undefined
        })
    })

    describe('conversion', () => {
        let binder: DefaultBinder

        beforeEach(() => {
            binder = new Binder(context)
                .forField(myField)
                .withConverter(new MomentConverter('DD.MM.YYYY'))
                .bind()
        })

        it('should convert values on storage', () => {
            myField.value = '23.01.2018'

            expect(moment.isMoment(binder.store().myField)).to.be.true
        })

        it('should reverse convert values on load', () => {
            binder.load({ myField: moment('2018-01-23', 'YYYY-MM-DD') })

            expect(myField.value).to.equal('23.01.2018')
        })

        it('should handle conversion errors like validation errors', () => {
            myField.value = '23.01.'

            expect(binder.store().myField).to.be.undefined
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('conversions.error.moment(value=23.01.)')
        })

        it('should allow validations on converted values', () => {
            binder = new Binder(context)
                .forField(myField)
                .withConverter(new MomentConverter('DD.MM.YYYY'))
                .withValidator(MomentValidators.dayInFuture())
                .bind()

            myField.value = '23.01.2018'

            expect(binder.store().myField).to.be.undefined
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.include('validations.dayInFuture(value=Tue Jan 23 2018 00:00:00')
        })
    })

    describe('value change', () => {
        let binder: DefaultBinder

        beforeEach(() => {
            binder = new Binder(context)
                .forField(myField).isRequired().withValidator(StringValidators.lengths(5, 10)).bind()
        })

        it('should be marked as unchanged after load', () => {
            binder.load({ myField: 'value' })
            expect(binder.changed).to.be.false
        })

        it('should be marked as changed after value change', () => {
            binder.load({ myField: 'value' })
            myField.updateValue('other')
            expect(binder.changed).to.be.true
        })

        it('should be marked as unchanged after change back to initial value', () => {
            binder.load({ myField: 'value' })
            myField.updateValue('other')
            myField.updateValue('value')
            expect(binder.changed).to.be.false
        })

        it('field should be marked as unchanged after load', () => {
            binder.load({ myField: 'value' })
            expect(myField.changed).to.be.false
        })

        it('field should be marked as changed after value change', () => {
            binder.load({ myField: 'value' })
            myField.updateValue('other')
            expect(myField.changed).to.be.true
        })

        it('field should be marked as unchanged after change back to initial value', () => {
            binder.load({ myField: 'value' })
            myField.updateValue('other')
            myField.updateValue('value')
            expect(myField.changed).to.be.false
        })

        it('should should allow marking fields as unchanged explicitly', () => {
            binder.load({ myField: 'value' })
            myField.updateValue('other')
            binder.setUnchanged()
            expect(myField.changed).to.be.false
        })

        it('should allow to react on value change events', () => {
            const changeHandlerSpy = sandbox.spy()

            binder = new Binder(context)
                .forField(myField).onChange(changeHandlerSpy).bind()
            binder.load({ myField: 'value' })

            myField.updateValue('oth')
            myField.updateValue('other')

            expect(changeHandlerSpy).to.have.been.calledTwice
            expect(changeHandlerSpy).to.have.been.calledWith('oth')
            expect(changeHandlerSpy).to.have.been.calledWith('other')
        })
    })

    describe('submission', () => {
        let binder: DefaultBinder

        beforeEach(() => {
            binder = new Binder(context)
                .forField(myField).isRequired().withValidator(StringValidators.lengths(5, 10)).bind()
        })

        it('should reject on field errors', () => {
            return binder.submit().should.be.rejected
        })

        it('should show validation results on all fields', () => {
            return binder.submit().should.be.rejected.then(() => {
                expect(myField.showValidationResults).to.be.true
            })
        })

        it('should resolve with stored values if all fields are valid', () => {
            myField.value = '12345'
            return binder.submit().then(results => {
                expect(results).to.deep.equal({ myField: '12345' })
            })
        })

        it('should resolve with stored values in passed target object if all fields are valid', () => {
            const target = {
                other: 'value'
            }
            myField.value = '12345'

            return binder.submit(target).then(results => {
                expect(results).to.equal(target)
                expect(results).to.deep.equal({
                    myField: '12345',
                    other: 'value'
                })
            })
        })

        describe('status', () => {
            it('should allow passing a validation success method to be part of submission to provide a submission status', () => {
                myField.value = '12345'

                expect(binder.submitting).to.be.false
                return binder.submit({}, target => {
                    expect(target).to.deep.equal({ myField: '12345' })
                    expect(binder.submitting).to.be.true
                }).then(() => {
                    expect(binder.submitting).to.be.false
                })
            })

            it('should also reject if validation success method rejects', () => {
                myField.value = '12345'

                return binder.submit({}, () => {
                    throw new Error('submission failed')
                }).should.be.rejected.then((err: Error) => {
                    expect(binder.submitting).to.be.false
                    expect(err.message).to.equal('submission failed')
                })
            })
        })
    })

    describe('removal', () => {
        let binder: DefaultBinder

        beforeEach(() => {
            binder = new Binder(context)
                .forField(myField).isRequired().bind()
                .forField(secondField).isRequired().bind()
        })

        it('should allow removal of an existing field', () => {
            binder.removeBinding(secondField)
            expect(() => binder.binding(secondField)).to.throw(Error, 'Cannot find binding for secondField')
        })

        it('should allow removal of an existing field', () => {
            binder.load({ myField: 'test' })
            expect(binder.valid).to.be.false

            binder.removeBinding(secondField)
            expect(binder.valid).to.be.true
        })
    })
})
