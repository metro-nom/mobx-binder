import { expect } from 'chai'
import { FieldStore } from '../fields/FieldStore'
import { TextField } from '../fields/TextField'
import { Binder, Validator } from './Binder'
import * as moment from 'moment'
import * as sinon from 'sinon'
import sleep from '../../test/sleep'
import { ErrorMessage, SimpleBinder } from './SimpleBinder'
import { Converter, ValidationError } from '../..'
import { action, observable } from 'mobx'

const lengthValidator = (min: number, max: number): Validator<ErrorMessage, string> =>
    (value?: string) => !!value && (value.length < min || value.length > max) ? 'Wrong length' : undefined

const numberValidator = (max: number) => (num?: number) => num !== undefined && num > max ? 'Too much' : undefined

class SimpleNumberConverter implements Converter<ErrorMessage, string, number> {
    public convertToModel(value: string): number | undefined {
        if (isNaN(Number(value))) {
            throw new ValidationError('Not a number')
        }
        return Number(value)
    }

    public convertToPresentation(data?: number): string | undefined {
        return data !== undefined ? `${data}` : ''
    }
}

describe('Binder', () => {
    const sandbox = sinon.createSandbox()

    let myField: FieldStore<string>
    let secondField: FieldStore<string>
    let clock: sinon.SinonFakeTimers

    beforeEach(action(() => {
        myField = new TextField('myField')
        secondField = new TextField('secondField')
        clock = sandbox.useFakeTimers()
        clock.setSystemTime(moment('2018-01-25').toDate().getTime())
    }))

    afterEach(() => {
        sandbox.restore()
    })

    describe('binding', () => {
        it('should provide access to a binding by field', () => {
            const binder = new SimpleBinder().forField(myField).bind()

            expect(binder.binding(myField).validate).to.be.a('function')
        })

        it('should fail with error on unbound field', () => {
            const binder = new SimpleBinder()

            expect(() => binder.binding(myField)).to.throw(Error, 'Cannot find binding for myField')
        })

        describe('load', () => {
            it('should clear form (load from empty field)', () => {
                const binder = new SimpleBinder().forField(myField).bind()
                myField.value = '12345'
                binder.clear()
                expect(myField.value).to.equal('')
            })

            it('should load from bound target property named after the field', () => {
                const binder = new SimpleBinder().forField(myField).bind()
                binder.load({ myField: 'value' })
                expect(myField.value).to.equal('value')
            })

            it('should allow loading from custom target property', () => {
                const binder = new SimpleBinder().forField(myField).bind('someKey')
                binder.load({ someKey: 'value' })
                expect(myField.value).to.equal('value')
            })

            it('should allow loading via custom read function', () => {
                const binder = new SimpleBinder().forField(myField).bind2((source: any) => source.someKey)
                binder.load({ someKey: 'value' })
                expect(myField.value).to.equal('value')
            })
        })

        describe('store', () => {
            it('should store to bound target property named after the field, updating the given target object', () => {
                const binder = new SimpleBinder().forField(myField).bind()
                const target = { previous: 'value' }
                myField.updateValue('changedValue')

                const returnedTarget = binder.store(target)

                expect(target).to.deep.equal({
                    previous: 'value',
                    myField: 'changedValue',
                })
                expect(returnedTarget).to.equal(target)
            })

            it('should store to new empty object if none is given', () => {
                const binder = new SimpleBinder().forField(myField).bind()
                myField.updateValue('changedValue')

                const returnedTarget = binder.store()

                expect(returnedTarget).to.deep.equal({ myField: 'changedValue' })
            })

            it('should allow storing to custom target property', () => {
                const binder = new SimpleBinder().forField(myField).bind('someKey')
                myField.updateValue('changedValue')

                expect(binder.store()).to.deep.equal({ someKey: 'changedValue' })
            })

            it('should allow storing via custom write function', () => {
                const binder = new SimpleBinder().forField(myField).bind2(
                    () => '',
                    (target: any, value?: string) => target.someKey = value)

                myField.updateValue('changedValue')

                expect(binder.store()).to.deep.equal({ someKey: 'changedValue' })
            })

            it('should mark field as readonly if no storage function is given', () => {
                new SimpleBinder().forField(myField).bind2(() => '')

                expect(myField.readOnly).to.be.true
            })

            it('should allow marking a field as readonly', () => {
                new SimpleBinder().forField(myField).isReadOnly().bind()
                expect(myField.readOnly).to.be.true
            })

            it('should not store readonly fields', () => {
                const binder = new SimpleBinder().forField(myField).isReadOnly().bind()
                myField.value = '12345'

                expect(binder.store()).to.deep.equal({})
            })
        })
    })

    describe('validation', () => {
        let binder: SimpleBinder

        beforeEach(() => {
            binder = new SimpleBinder()
                .forField(myField).isRequired().withValidator(lengthValidator(5, 10)).bind()
        })

        it('should expose the initial validity of a field during binding', () => {
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.be.ok
        })

        it('should mark fields without validators as valid', () => {
            binder = new SimpleBinder().forField(myField).bind()

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
            expect(myField.errorMessage).to.equal('Please enter a value')
        })

        it('should return negative validation results on validate()', () => {
            expect(binder.binding(myField).validate()).to.equal('Please enter a value')
        })

        it('should return positive validation results on validate()', () => {
            myField.value = '12345'
            expect(binder.binding(myField).validate()).to.be.undefined
        })

        it('should mark field as required on isRequired()', () => {
            expect(myField.required).to.be.true
        })

        it('should expose second validation if first is succeeding', () => {
            myField.value = '123'
            expect(myField.errorMessage).to.equal('Wrong length')
        })

        it('should not store invalid values', () => {
            expect(binder.store()).to.deep.equal({})
        })

        it('should provide global validation status for submit button', () => {
            expect(binder.valid).to.be.false
        })
    })

    describe('async validation', () => {
        let binder: SimpleBinder
        let validator: any

        beforeEach(() => {
            validator = sandbox.stub().resolves(undefined)
            binder = new SimpleBinder()
                .forField(myField).isRequired().withAsyncValidator(validator).bind()
        })

        it('should initially be valid == false because of sync validation', () => {
            expect(myField.valid).to.be.false
        })

        it('should initially be valid == undefined when there are no sync validators at all', () => {
            binder = new SimpleBinder().forField(myField).withAsyncValidator(validator).bind()
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
            validator.resolves('my async error')
            myField.value = '12345'

            return binder.submit().should.be.rejected.then(() => {
                expect(myField.valid).to.be.false
                expect(myField.errorMessage).to.equal('my async error')
            })
        })

        it('should not call submission function if asynchronous validations fail', () => {
            let called = false
            validator.resolves('my async error')
            myField.value = '12345'

            return binder.submit({}, () => {
                called = true
            }).should.be.rejected.then(() => {
                expect(called).to.be.false
            })
        })

        it('should return promise that resolves with stored values, even if onSubmit returns something else', () => {
            myField.value = '12345'

            return binder.submit({} as any, () => {
                return Promise.resolve('bla')
            }).then((values: any) => {
                expect(values).to.deep.equal({ myField: '12345' })
            })
        })

        it('should trigger asynchronous validators on blur if configured', () => {
            binder = new SimpleBinder()
                .forField(myField).isRequired().withAsyncValidator(validator, { onBlur: true }).bind()

            myField.value = '12345'
            myField.handleBlur()

            expect(validator).to.have.been.calledWith('12345')
        })

        it('should respect synchronous validations before asynchronous validators', () => {
            binder = new SimpleBinder()
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

            binder = new SimpleBinder()
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
            expect(myField.errorMessage).to.equal('Please enter a value')

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
            binder = new SimpleBinder()
                .forField(myField).isRequired().withAsyncValidator(() => {
                    expect(myField.validating).to.be.true
                    return Promise.resolve(undefined)
                }, { onBlur: true }).bind()

            myField.value = '12345'
            myField.handleBlur()
            return binder.validateAsync().then(() => {
                expect(myField.validating).to.be.false
            })
        })

        it('should not revalidate if value didn\'t change', () => {
            binder = new SimpleBinder()
                .forField(myField).isRequired().withAsyncValidator(validator, { onBlur: true }).bind()

            myField.value = '12345'
            return binder.validateAsync()
                .then(() => binder.validateAsync())
                .then(() => {
                    expect(validator).to.have.been.calledOnce
                })
        })

        it('should not show success if asynchronous validation has not been done for that value', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(() => {
                    return sleep(1000).then(() => 'fail')
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
        let binder: SimpleBinder
        let validator: any

        beforeEach(() => {
            validator = sandbox.stub().resolves(undefined)
            binder = new SimpleBinder()
                .forField(myField).isRequired().withAsyncValidator(validator).bind()
                .forField(secondField).isRequired().bind()
        })

        it('should be valid if no fields are registered', () => {
            expect(new SimpleBinder().valid).to.be.true
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
        let binder: SimpleBinder

        beforeEach(() => {
            binder = new SimpleBinder()
                .forField(myField)
                .withConverter(new SimpleNumberConverter())
                .bind()
        })

        it('should convert values on storage', () => {
            myField.value = '5'

            expect(!isNaN(binder.store().myField)).to.be.true
        })

        it('should reverse convert values on load', () => {
            binder.load({ myField: 5 })

            expect(myField.value).to.equal('5')
        })

        it('should handle conversion errors like validation errors', () => {
            myField.value = 'bla'

            expect(binder.store().myField).to.be.undefined
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('Not a number')
        })

        it('should allow validations on converted values', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .withConverter(new SimpleNumberConverter())
                .withValidator(numberValidator(5))
                .bind()

            myField.value = '6'

            expect(binder.store().myField).to.be.undefined
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('Too much')
        })
    })

    describe('value change', () => {
        let binder: SimpleBinder

        beforeEach(() => {
            binder = new SimpleBinder()
                .forField(myField).isRequired().withValidator(lengthValidator(5, 10)).bind()
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

        it('should be marked as changed after value change and both are observables', () => {
            binder.load({ myField: observable.box('value') })
            myField.updateValue(observable.box('other') as any)
            expect(binder.changed).to.be.true
        })

        it('should not be marked as changed if updated with same value being an observables', () => {
            binder.load({ myField: observable.box('value') })
            myField.updateValue(observable.box('value') as any)
            expect(binder.changed).to.be.false
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

            binder = new SimpleBinder()
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
        let binder: SimpleBinder

        beforeEach(() => {
            binder = new SimpleBinder()
                .forField(myField).isRequired().withValidator(lengthValidator(5, 10)).bind()
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
                other: 'value',
            }
            myField.value = '12345'

            return binder.submit(target).then(results => {
                expect(results).to.equal(target)
                expect(results).to.deep.equal({
                    myField: '12345',
                    other: 'value',
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
        let binder: SimpleBinder

        beforeEach(() => {
            binder = new SimpleBinder()
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
