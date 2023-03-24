import { ErrorMessage, FieldStore, SimpleBinder, TextField, ToggleField, Validator } from '../..'
import { action, observable, reaction } from 'mobx'

import { expect } from 'chai'
import sinon from 'sinon'

import sleep from '../../utils/sleep'
import { SimpleNumberConverter } from '../../test/SimpleNumberConverter'
import { ComplexField } from '../../test/ComplexField'
import { SimpleAsyncNumberConverter } from '../../test/SimpleAsyncNumberConverter'

const lengthValidator = (min: number, max: number): Validator<ErrorMessage, string | undefined> => (value?: string) =>
    !!value && (value.length < min || value.length > max) ? 'Wrong length' : undefined

const numberValidator = (max: number) => (num?: number) => (num !== undefined && num > max ? 'Too much' : undefined)

describe('Binder', () => {
    const sandbox = sinon.createSandbox()

    let myField: FieldStore<string>
    let secondField: FieldStore<string>
    let toggleField: ToggleField

    beforeEach(
        action(() => {
            myField = new TextField('myField')
            secondField = new TextField('secondField')
            toggleField = new ToggleField('toggleField')
        }),
    )

    afterEach(() => {
        sandbox.restore()
    })

    describe('binding', () => {
        it('should provide access to a binding by field', () => {
            const binder = new SimpleBinder().forField(myField).bind()

            expect(binder.binding(myField).validateAsync).to.be.a('function')
        })

        it('should fail with error on unbound field', () => {
            const binder = new SimpleBinder()

            expect(() => binder.binding(myField)).to.throw(Error, 'Cannot find binding for myField')
        })

        describe('load', () => {
            it('should clear form (load from empty field)', () => {
                const binder = new SimpleBinder().forStringField(myField).bind()
                myField.updateValue('12345')
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

        describe('apply', () => {
            describe('on Binder level', () => {
                it('should update all field values from a source object', () => {
                    const binder = new SimpleBinder()
                        .forField(myField)
                        .withConverter(new SimpleNumberConverter())
                        .bind()
                        .forField(secondField)
                        .bind()
                    binder.load({
                        myField: 123,
                        secondField: 'second',
                    })
                    binder.apply({
                        myField: 234,
                        secondField: 'second',
                    })
                    expect(myField.value).to.equal('234')
                    expect(myField.changed).to.be.true
                    expect(secondField.changed).to.be.false
                })
            })

            describe('on Binding level', () => {
                it("should update a field value from it's backend representation via a given source object", () => {
                    const binder = new SimpleBinder()
                        .forField(myField)
                        .withConverter(new SimpleNumberConverter())
                        .bind()
                    binder.load({ myField: 5 })
                    binder.binding(myField).apply({ myField: 6 })
                    expect(myField.value).to.equal('6')
                    expect(myField.changed).to.be.true
                })

                it("should not change anything if the backend value didn't change", () => {
                    const binder = new SimpleBinder()
                        .forField(myField)
                        .withConverter(new SimpleNumberConverter())
                        .bind()
                    binder.load({ myField: 5 })
                    binder.binding(myField).apply({ myField: 5 })
                    expect(myField.value).to.equal('5')
                    expect(myField.changed).to.be.false
                })
            })
        })

        describe('getFieldValue', () => {
            it('should return the view representation for the data in the given source object', () => {
                const binder = new SimpleBinder()
                    .forField(myField)
                    .withConverter(new SimpleNumberConverter())
                    .bind()
                expect(binder.binding(myField).getFieldValue({ myField: 6 })).to.equal('6')
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
                    (target: any, value?: string) => (target.someKey = value),
                )

                myField.updateValue('changedValue')

                expect(binder.store()).to.deep.equal({ someKey: 'changedValue' })
            })

            describe('readonly', () => {
                it('should mark field as readonly if no storage function is given', () => {
                    new SimpleBinder().forField(myField).bind2(() => '')

                    expect(myField.readOnly).to.be.true
                })

                it('should allow marking a field as readonly', () => {
                    new SimpleBinder()
                        .forField(myField)
                        .isReadOnly()
                        .bind()
                    expect(myField.readOnly).to.be.true
                })

                it('should not store readonly fields', () => {
                    const binder = new SimpleBinder()
                        .forField(myField)
                        .isReadOnly()
                        .bind()
                    myField.updateValue('12345')

                    expect(binder.store()).to.deep.equal({})
                })
            })

            describe('empty strings', () => {
                it('should store empty field values as empty strings by default', () => {
                    const binder = new SimpleBinder().forField(myField).bind()
                    const target = binder.store()

                    expect(target).to.deep.equal({
                        myField: '',
                    })
                })

                it('should support storing empty strings as undefined', () => {
                    const binder = new SimpleBinder()
                        .forField(myField)
                        .withStringOrUndefined()
                        .bind()
                    const target = binder.store()

                    expect(target).to.deep.equal({
                        myField: undefined,
                    })
                })

                it('should support storing empty strings as arbitrary values', () => {
                    const binder = new SimpleBinder()
                        .forField(myField)
                        .withEmptyString('[empty]')
                        .bind()
                    const target = binder.store()

                    expect(target).to.deep.equal({
                        myField: '[empty]',
                    })
                })

                it('should not allow calls to withEmptyString for non-string fields', () => {
                    expect(() => new SimpleBinder().forField(toggleField).withEmptyString(undefined)).to.throw('This is not a field of type string')
                })
                it('should not allow calls to withStringOrUndefined for non-string fields', () => {
                    expect(() => new SimpleBinder().forField(toggleField).withStringOrUndefined()).to.throw('This is not a field of type string')
                })
            })
        })
    })

    describe('changedData', () => {
        let binder: SimpleBinder

        beforeEach(() => {
            binder = new SimpleBinder()
                .forField(myField)
                .withValidator(lengthValidator(2, 12))
                .bind()
                .forField(secondField)
                .bind()
            binder.load({
                myField: 'my',
                secondField: 'second',
            })
        })

        it('should return data of valid and changed bindings', () => {
            myField.updateValue('changedValue')
            expect(binder.changedData).to.deep.equal({
                myField: 'changedValue',
            })
        })

        it('should not return data of invalid changed bindings', () => {
            myField.updateValue('invalidChangedValue')
            expect(binder.changedData).to.deep.equal({})
        })

        it('should return an empty object if nothing has changed', () => {
            expect(binder.changedData).to.deep.equal({})
        })
    })

    describe('validation', () => {
        let binder: SimpleBinder

        beforeEach(() => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withValidator(lengthValidator(5, 10))
                .bind()
        })

        it('should expose the initial validity of a field during binding', () => {
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('Please enter a value')

            expect(binder.binding(myField).validity).to.deep.equal({
                status: 'validated',
                result: 'Please enter a value',
            })
        })

        it('should mark fields without validators as valid', () => {
            binder = new SimpleBinder().forField(myField).bind()

            expect(myField.valid).to.be.true
            expect(myField.errorMessage).to.be.undefined

            expect(binder.binding(myField).validity).to.deep.equal({
                status: 'validated',
                result: undefined /* only for simple ValidationResult */,
            })
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
            myField.updateValue('12345')
            expect(myField.valid).to.be.true
            expect(myField.errorMessage).to.be.undefined
        })

        it('should add required validation via special isRequired()', () => {
            expect(myField.errorMessage).to.equal('Please enter a value')
        })

        it('should add required validation with custom translation via special isRequired()', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired('custom message')
                .bind()
            expect(myField.errorMessage).to.equal('custom message')
        })

        it('should return positive validation results', () => {
            myField.updateValue('12345')
            expect(myField.errorMessage).to.be.undefined
        })

        it('should mark field as required on isRequired()', () => {
            expect(myField.required).to.be.true
        })

        it('should expose second validation if first is succeeding', () => {
            myField.updateValue('123')
            expect(myField.errorMessage).to.equal('Wrong length')
        })

        it('should not store invalid values', () => {
            expect(binder.store()).to.deep.equal({})
        })

        it('should provide global validation status for submit button', () => {
            expect(binder.valid).to.be.false
        })

        describe('conditional required validation', () => {
            let condition: any

            beforeEach(() => {
                condition = sinon.stub().returns(true)

                binder = new SimpleBinder()
                    .forField(myField)
                    .isRequired('custom message', condition)
                    .bind()
            })

            it('should return required property based on isRequired condition', () => {
                expect(myField.required).to.be.true
                expect(myField.valid).to.be.false
                expect(myField.errorMessage).to.equal('custom message')

                condition.returns(false)
                expect(myField.required).to.be.false
                expect(myField.valid).to.be.true
                expect(myField.errorMessage).to.be.undefined
            })
        })

        describe('custom error message', () => {
            it('should allow setting a custom error message', () => {
                myField.errorMessage = 'My custom error message'
                expect(myField.errorMessage).to.equal('My custom error message')
            })

            it('should get invalid if custom error message is set', () => {
                myField.updateValue('valid')
                myField.errorMessage = 'My custom error message'
                expect(myField.valid).to.be.false
                expect(myField.errorMessage).to.equal('My custom error message')
            })

            it('should reset to calculated errors on next change', () => {
                myField.updateValue('valid')
                myField.errorMessage = 'My custom error message'
                myField.updateValue('other')
                expect(myField.valid).to.be.true
                expect(myField.errorMessage).to.be.undefined
            })
        })
    })

    describe('async validation', () => {
        let binder: SimpleBinder
        let validator: any

        beforeEach(() => {
            validator = sandbox.stub().resolves(undefined)
        })

        it('should initially be valid == false because of sync validation', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator)
                .bind()

            // TextField <- ViewWrapper <- RequiredValidator <- TrimConverter <- async validator

            expect(myField.valid).to.be.false
        })

        it('should initially be valid == undefined when there are no sync validators at all', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .withAsyncValidator(validator)
                .bind()
            expect(myField.valid).to.be.undefined

            expect(binder.binding(myField).validity).to.deep.equal({
                status: 'unknown',
            })
        })

        it('should not trigger asynchronous validators on change or blur by default', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator)
                .bind()

            myField.updateValue('12345')
            myField.handleBlur()

            expect(validator).to.not.have.been.calledOnce
            expect(binder.binding(myField).validity).to.deep.equal({
                status: 'unknowns',
            })
        })

        it('should trigger asynchronous validators on submit', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator)
                .bind()

            myField.updateValue('12345')

            return binder.submit().then(() => {
                expect(validator).to.have.been.calledWith('12345')
            })
        })

        it('should expose asynchronous validation results during submit', () => {
            validator.resolves('my async error')
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator)
                .bind()

            myField.updateValue('12345')

            return binder.submit().should.be.rejected.then(() => {
                expect(myField.valid).to.be.false
                expect(myField.errorMessage).to.equal('my async error')

                expect(binder.binding(myField).validity).to.deep.equal({
                    status: 'validated',
                    result: 'my async error',
                })
            })
        })

        it('should not call submission function if asynchronous validations fail', () => {
            let called = false
            validator.resolves('my async error')
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator)
                .bind()
            myField.updateValue('12345')

            return binder
                .submit({}, () => {
                    called = true
                })
                .should.be.rejected.then(() => {
                    expect(called).to.be.false
                })
        })

        it('should return promise that resolves with stored values, even if onSubmit returns something else', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator)
                .bind()

            myField.updateValue('12345')

            return binder
                .submit({} as any, () => {
                    return Promise.resolve('bla')
                })
                .then((values: any) => {
                    expect(values).to.deep.equal({ myField: '12345' })
                })
        })

        it('should trigger asynchronous validators on blur if configured', async () => {
            validator.resolves('my error')
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator, { onBlur: true })
                .bind()

            myField.updateValue('12345')
            await myField.handleBlur()
            await sleep(110)
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('my error')
            expect(validator).to.have.been.calledWith('12345')
        })

        it('should respect synchronous validations before asynchronous validators', async () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator, { onBlur: true })
                .bind()

            myField.updateValue('')
            myField.handleBlur()

            await sleep(10)

            expect(binder.valid).to.be.false
            expect(validator).to.not.have.been.called
        })

        it('should respect synchronous validations during ongoing asynchronous validators', async () => {
            validator = sandbox.spy(
                (value: string) =>
                    new Promise(resolve => {
                        setTimeout(() => {
                            value !== 'async fail' ? resolve(undefined) : resolve('async fail')
                        }, 20)
                    }),
            )

            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator, { onBlur: true })
                .bind()
            myField.updateValue('validValue')

            expect(validator).to.not.have.been.called

            // myField.handleBlur()
            const promise = binder.binding(myField).validateAsync(true)

            // during async validation
            await sleep(10)

            expect(binder.valid).to.be.undefined
            expect(binder.validating).to.be.true

            expect(myField.validating).to.be.true
            expect(myField.valid).to.be.undefined
            expect(binder.binding(myField).validity).to.deep.equal({
                status: 'validating',
            })
            expect(validator).to.have.been.calledOnce

            // after change and synchronous error
            myField.updateValue('')
            expect(binder.valid).to.be.false
            expect(myField.validating).to.be.false
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('Please enter a value')
            expect(binder.binding(myField).validity).to.deep.equal({
                status: 'validated',
                result: 'Please enter a value',
            })

            // there shoul
            await sleep(15)
            await promise
            expect(myField.validating).to.be.false
            expect(binder.valid).to.be.false
            expect(myField.valid).to.be.false

            await sleep(10)
            expect(binder.valid).to.be.false
            expect(myField.valid).to.be.false
            expect(validator).to.have.been.calledOnce
        })

        it('should toggle validating property during asynchronous validation', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(
                    () => {
                        expect(myField.validating).to.be.true
                        return Promise.resolve(undefined)
                    },
                    { onBlur: true },
                )
                .bind()

            myField.updateValue('12345')
            myField.handleBlur()
            return binder.validateAsync().then(() => {
                expect(myField.validating).to.be.false
            })
        })

        it("should not revalidate if value didn't change", () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator, { onBlur: true })
                .bind()

            myField.updateValue('12345')
            return binder
                .validateAsync()
                .then(() => binder.validateAsync())
                .then(() => {
                    expect(validator).to.have.been.calledOnce
                })
        })

        it('should not show success if asynchronous validation has not been done for that value', async () => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(() => sleep(100).then(() => 'fail'), { onBlur: true })
                .bind()

            myField.updateValue('12345')
            const promise = binder.validateAsync().should.be.rejected
            await sleep(200)
            await promise

            myField.updateValue('123456')
            expect(myField.valid).to.be.undefined
        })
    })

    describe('async conversion', () => {
        let binder: SimpleBinder
        let converter: SimpleAsyncNumberConverter

        beforeEach(() => {
            converter = new SimpleAsyncNumberConverter()
            sandbox.spy(converter, 'convertToModel')
        })

        it('should initially be valid == false because of sync validation', () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter)
                .bind()

            // TextField <- ViewWrapper <- RequiredValidator <- TrimConverter <- async validator

            expect(myField.valid).to.be.false
        })

        it('should initially be valid == undefined when there are no sync validators at all', () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .withAsyncConverter(converter)
                .bind()
            expect(myField.valid).to.be.undefined
            expect(binder.binding(myField).validity).to.deep.equal({
                status: 'unknown',
            })
        })

        it('should not trigger asynchronous validators on change or blur by default', () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter)
                .bind()

            myField.updateValue('12345')
            myField.handleBlur()

            expect(converter.convertToModel).to.not.have.been.called
        })

        it('should trigger asynchronous validators on submit', () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter)
                .bind()

            myField.updateValue('12345')

            return binder.submit().then(() => {
                expect(converter.convertToModel).to.have.been.calledWith('12345')
            })
        })

        it('should update field value with "corrected" value after async validation', () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter)
                .bind()

            myField.updateValue('012345')

            return binder.submit().then(() => {
                expect(myField.value).to.equal('12345')
            })
        })

        it('should not validate corrected field value again on async validation', async () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter)
                .bind()

            myField.updateValue('012345')

            await binder.validateAsync()
            await binder.validateAsync()

            expect(converter.convertToModel).to.have.been.calledOnce
        })

        it('should expose asynchronous validation results during submit', () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter)
                .bind()

            myField.updateValue('abcde')

            return binder.submit().should.be.rejected.then(() => {
                expect(myField.valid).to.be.false
                expect(myField.errorMessage).to.equal('not a number')
            })
        })

        it('should not call submission function if asynchronous validations fail', () => {
            let called = false
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter)
                .bind()
            myField.updateValue('abcde')

            return binder
                .submit({}, () => {
                    called = true
                })
                .should.be.rejected.then(() => {
                    expect(called).to.be.false
                })
        })

        it('should return promise that resolves with stored values, even if onSubmit returns something else', () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter)
                .bind()

            myField.updateValue('12345')

            return binder
                .submit({} as any, () => {
                    return Promise.resolve('bla')
                })
                .then((values: any) => {
                    expect(values).to.deep.equal({ myField: 12345 })
                })
        })

        it('should trigger asynchronous validators on blur if configured', async () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter, { onBlur: true })
                .bind()

            myField.updateValue('abcde')
            myField.handleBlur()
            await sleep(110)

            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('not a number')
            expect(converter.convertToModel).to.have.been.calledWith('abcde')
        })

        it('should respect synchronous validations before asynchronous validators', async () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter, { onBlur: true })
                .bind()

            myField.updateValue('')
            myField.handleBlur()

            await sleep(10)

            expect(binder.valid).to.be.false
            expect(converter.convertToModel).to.not.have.been.called
        })

        it('should respect synchronous validations during ongoing asynchronous validators', async () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter, { onBlur: true })
                .bind()
            myField.updateValue('12345')

            expect(converter.convertToModel).to.not.have.been.called

            // myField.handleBlur()
            const promise = binder.binding(myField).validateAsync(true)

            // during async validation
            await sleep(5)

            expect(binder.valid).to.be.undefined
            expect(binder.validating).to.be.true
            expect(myField.validating).to.be.true
            expect(myField.valid).to.be.undefined
            expect(converter.convertToModel).to.have.been.calledOnce

            // after change and synchronous error
            myField.updateValue('')
            expect(binder.valid).to.be.false
            expect(myField.validating).to.be.false
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('Please enter a value')

            // there shoul
            await sleep(15)
            await promise
            expect(myField.validating).to.be.false
            expect(binder.valid).to.be.false
            expect(myField.valid).to.be.false

            await sleep(10)
            expect(binder.valid).to.be.false
            expect(myField.valid).to.be.false
            expect(converter.convertToModel).to.have.been.calledOnce
        })

        it('should toggle validating property during asynchronous validation', async () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(
                    {
                        convertToModel: async () => {
                            await sleep(10)
                            expect(myField.validating).to.be.true
                            return Promise.resolve(12345)
                        },
                        convertToPresentation: () => '',
                    },
                    { onBlur: true },
                )
                .bind()

            myField.updateValue('12345')
            await binder.validateAsync()

            expect(myField.validating).to.be.false
        })

        it("should not revalidate if value didn't change", () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter, { onBlur: true })
                .bind()

            myField.updateValue('12345')
            return binder
                .validateAsync()
                .then(() => binder.validateAsync())
                .then(() => {
                    expect(converter.convertToModel).to.have.been.calledOnce
                })
        })

        it('should not show success if asynchronous validation has not been done for that value', async () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withAsyncConverter(converter, { onBlur: true })
                .bind()

            myField.updateValue('abcde')
            const promise = binder.validateAsync().should.be.rejected
            await sleep(20)
            await promise

            myField.updateValue('123456')
            expect(myField.valid).to.be.undefined
        })
    })

    describe('global validity', () => {
        let binder: SimpleBinder
        let validator: any

        beforeEach(() => {
            validator = sandbox.stub().resolves(undefined)
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withAsyncValidator(validator)
                .bind()
                .forField(secondField)
                .isRequired()
                .bind()
        })

        it('should be valid if no fields are registered', () => {
            expect(new SimpleBinder().valid).to.be.true
        })

        it('should be globally valid if all fields are valid', async () => {
            myField.updateValue('valid')
            secondField.updateValue('valid')
            await binder.validateAsync()
            await sleep(50)

            expect(binder.valid).to.be.true
        })

        it('should be globally invalid if any fields is invalid', async () => {
            myField.updateValue('')
            secondField.updateValue('valid')

            expect(binder.valid).to.be.false
        })

        it('should be undefined if asynchronous validations did not yet start/complete', async () => {
            myField.updateValue('synchronously valid')
            secondField.updateValue('valid')

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
            myField.updateValue('5')

            expect(!isNaN(binder.store().myField)).to.be.true
        })

        it('should reverse convert values on load', () => {
            binder.load({ myField: 5 })

            expect(myField.value).to.equal('5')
        })

        it('should not update field value with "corrected" value on regular changes', () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withConverter(new SimpleNumberConverter())
                .bind()

            myField.updateValue('012345')

            expect(myField.value).to.equal('012345')
        })

        it('should update field value with "corrected" value on explicit validation', () => {
            binder = new SimpleBinder()
                .forStringField(myField)
                .isRequired()
                .withConverter(new SimpleNumberConverter())
                .bind()

            myField.updateValue('012345')

            return binder.submit().then(() => {
                expect(myField.value).to.equal('12345')
            })
        })

        it('should handle conversion errors like validation errors', () => {
            myField.updateValue('bla')

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

            myField.updateValue('6')

            expect(binder.store().myField).to.be.undefined
            expect(myField.valid).to.be.false
            expect(myField.errorMessage).to.equal('Too much')
        })
    })

    describe('value change', () => {
        let binder: SimpleBinder

        beforeEach(() => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withValidator(lengthValidator(5, 10))
                .bind()
        })

        it('should be marked as unchanged before load', () => {
            expect(myField.changed).to.be.false
            expect(binder.binding(myField).changed).to.be.false
            expect(binder.changed).to.be.false
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

        it('should be marked as unchanged after change back to initial value even on complex values', () => {
            const field = new ComplexField('myComplexField')
            binder = new SimpleBinder().forField(field).bind()
            binder.load({ myComplexField: ['value'] })
            field.updateValue(['other'])
            field.updateValue(['value'])
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
                .forField(myField)
                .onChange(changeHandlerSpy)
                .bind()
            binder.load({ myField: 'value' })

            myField.updateValue('oth')
            myField.updateValue('other')

            expect(changeHandlerSpy).to.have.been.calledTwice
            expect(changeHandlerSpy).to.have.been.calledWith('oth')
            expect(changeHandlerSpy).to.have.been.calledWith('other')
        })

        it('should allow to grab intermediate results on Change', () => {
            const changeHandlerSpy = sandbox.spy()

            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withConverter(new SimpleNumberConverter())
                .onChange(changeHandlerSpy)
                .bind()
            binder.load({ myField: 7 })

            myField.updateValue('4')
            myField.updateValue('wrong')
            myField.updateValue('8')

            expect(changeHandlerSpy).to.have.been.calledTwice
            expect(changeHandlerSpy.firstCall.args[0]).to.equal(4)
            expect(changeHandlerSpy.secondCall.args[0]).to.equal(8)
        })

        it('should support conditional validation without using onChange()', () => {
            binder = new SimpleBinder()
                .forField(myField)
                .bind()
                .forField(secondField)
                .isRequired(undefined, () => myField.value === 'A')
                // needed to also test for data propagation correctness
                .withValidator(value => (!!value && value.length > 5 ? 'error' : undefined))
                .bind()

            binder.load({
                myField: 'B',
                secondField: '',
            })

            expect(secondField.required).to.be.false
            expect(secondField.valid).to.be.true

            const requiredObserverStub = sinon.stub()
            const validObserverStub = sinon.stub()
            reaction(() => secondField.required, requiredObserverStub)
            reaction(() => secondField.valid, validObserverStub)

            myField.updateValue('A')

            expect(requiredObserverStub).to.have.been.calledWith(true)
            expect(validObserverStub).to.have.been.calledWith(false)

            expect(secondField.required).to.be.true
            expect(secondField.valid).to.be.false
        })
    })

    describe('submission', () => {
        let binder: SimpleBinder

        beforeEach(() => {
            binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .withValidator(lengthValidator(5, 10))
                .bind()
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
            myField.updateValue('12345')
            return binder.submit().then(results => {
                expect(results).to.deep.equal({ myField: '12345' })
            })
        })

        it('should resolve with stored values in passed target object if all fields are valid', () => {
            const target = {
                other: 'value',
            }
            myField.updateValue('12345')

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
                myField.updateValue('12345')

                expect(binder.submitting).to.be.false
                return binder
                    .submit({}, target => {
                        expect(target).to.deep.equal({ myField: '12345' })
                        expect(binder.submitting).to.be.true
                    })
                    .then(() => {
                        expect(binder.submitting).to.be.false
                    })
            })

            it('should also reject if validation success method rejects', () => {
                myField.updateValue('12345')

                return binder
                    .submit({}, () => {
                        throw new Error('submission failed')
                    })
                    .should.be.rejected.then((err: Error) => {
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
                .forField(myField)
                .isRequired()
                .bind()
                .forField(secondField)
                .isRequired()
                .bind()
        })

        it('should allow removal of an existing field', () => {
            binder.load({ myField: 'test' })
            expect(binder.valid).to.be.false

            binder.removeBinding(secondField)
            expect(binder.valid).to.be.true
        })

        it('should fail removing non-registered field', () => {
            binder.removeBinding(secondField)
            expect(() => binder.binding(secondField)).to.throw(Error, 'Cannot find binding for secondField')
        })
    })

    describe('3rd party field value validation', () => {
        let binder: SimpleBinder

        describe('without chain', () => {
            beforeEach(() => {
                binder = new SimpleBinder().forField(myField).bind()
            })

            it('should always accept a string', () => {
                expect(binder.binding(myField).validateValue('6')).to.be.undefined
            })
        })

        describe('with converter', () => {
            beforeEach(() => {
                binder = new SimpleBinder()
                    .forField(myField)
                    .withConverter(new SimpleNumberConverter())
                    .bind()
            })

            it('should report failures synchronously', () => {
                expect(binder.binding(myField).validateValue('abc')).to.equal('Not a number')
            })
            it('should report success synchronously', () => {
                expect(binder.binding(myField).validateValue('123')).to.be.undefined
            })
        })

        describe('with simple validator', () => {
            beforeEach(() => {
                binder = new SimpleBinder()
                    .forField(myField)
                    .withValidator(lengthValidator(5, 10))
                    .bind()
            })

            it('should report failures synchronously', () => {
                expect(binder.binding(myField).validateValue('123')).to.equal('Wrong length')
            })
            it('should report success synchronously', () => {
                expect(binder.binding(myField).validateValue('123456')).to.be.undefined
            })
        })

        describe('with async validator', () => {
            beforeEach(() => {
                binder = new SimpleBinder()
                    .forField(myField)
                    .withAsyncValidator(value => sleep(10).then(() => lengthValidator(5, 10)(value)))
                    .bind()
            })

            it('should report failures asynchronously', async () => {
                expect(await binder.binding(myField).validateValue('123')).to.equal('Wrong length')
            })
            it('should report success asynchronously', async () => {
                expect(await binder.binding(myField).validateValue('123456')).to.be.undefined
            })
        })

        describe('with async converter', () => {
            beforeEach(() => {
                binder = new SimpleBinder()
                    .forStringField(myField)
                    .withAsyncConverter(new SimpleAsyncNumberConverter())
                    .bind()
            })

            it('should report failures asynchronously', async () => {
                expect(await binder.binding(myField).validateValue('abc')).to.equal('not a number')
            })
            it('should report success asynchronously', async () => {
                expect(await binder.binding(myField).validateValue('123456')).to.be.undefined
            })
        })

        describe('with multiple steps', () => {
            beforeEach(() => {
                binder = new SimpleBinder()
                    .forField(myField)
                    .onChange(() => undefined)
                    .withAsyncValidator(value => sleep(10).then(() => lengthValidator(5, 10)(value)))
                    .withConverter(new SimpleNumberConverter())
                    .bind()
            })

            it('should report length errors first', async () => {
                expect(await binder.binding(myField).validateValue('abc')).to.equal('Wrong length')
            })
            it('should report conversion errors if length is ok', async () => {
                expect(await binder.binding(myField).validateValue('abcde')).to.equal('Not a number')
            })
            it('should report success asynchronously', async () => {
                expect(await binder.binding(myField).validateValue('123456')).to.be.undefined
            })
        })
    })

    describe('debugging', () => {
        it('should provide the current state of a binding chain as a list', () => {
            const binder = new SimpleBinder().forField(myField).bind()

            expect(binder.binding(myField).state).to.deep.equal([
                {
                    name: 'myField',
                    type: 'field<string>',
                    data: {
                        pending: false,
                        value: '',
                    },
                    required: false,
                    validity: {
                        result: undefined,
                        status: 'validated',
                    },
                    more: undefined,
                },
            ])
        })

        it('should provide one entry for each chained modification', () => {
            const binder = new SimpleBinder().forStringField(myField).bind()

            expect(binder.binding(myField).state).to.deep.equal([
                {
                    name: 'myField',
                    type: 'field<string>',
                    data: {
                        pending: false,
                        value: '',
                    },
                    required: false,
                    validity: {
                        result: undefined,
                        status: 'validated',
                    },
                    more: undefined,
                },
                {
                    name: 'EmptyStringConverter',
                    type: 'conversion',
                    data: {
                        pending: false,
                        value: undefined,
                    },
                    required: false,
                    validity: {
                        result: undefined,
                        status: 'validated',
                    },
                },
            ])
        })

        it('should provide one entry for each validator', () => {
            const binder = new SimpleBinder()
                .forField(myField)
                .isRequired()
                .bind()

            expect(binder.binding(myField).state).to.deep.equal([
                {
                    name: 'myField',
                    type: 'field<string>',
                    data: {
                        pending: false,
                        value: '',
                    },
                    required: false,
                    validity: {
                        result: undefined,
                        status: 'validated',
                    },
                    more: undefined,
                },
                {
                    name: 'required(value=true)',
                    type: 'validation',
                    data: {
                        pending: true,
                    },
                    required: true,
                    validity: {
                        result: 'Please enter a value',
                        status: 'validated',
                    },
                },
            ])
        })
    })
})
