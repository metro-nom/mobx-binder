import { expect } from 'chai'
import { TextField } from './TextField'
import sinon from 'sinon'
import * as mobx from 'mobx'
import dataDriven from 'data-driven'
import { FieldStore } from './FieldStore'
import { Binding } from '../binder/Binder'

describe('TextField', () => {
    const sandbox = sinon.createSandbox()

    let textField: TextField
    let textObserver: sinon.SinonStub

    beforeEach(() => {
        textField = new TextField('fullName')
        textObserver = sandbox.stub()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('initial value', () => {
        it('should have a name', () => {
            expect(textField.name).to.equal('fullName')
        })

        it('should have an initially empty value', () => {
            expect(textField.value).to.equal('')
        })

        it('should not have been visited', () => {
            expect(textField.visited).to.be.false
        })
    })

    describe('editing', () => {
        it('should allow to change a value', () => {
            textField.updateValue('newValue')
            expect(textField.value).to.equal('newValue')
        })

        it('should have an observable value', () => {
            mobx.observe(textField, 'value', textObserver)
            textField.updateValue('newValue')
            expect(textObserver.firstCall.args[0].newValue).to.equal('newValue')
        })
    })

    describe('onBlur', () => {
        it('should not show validation results synchronously on blur', () => {
            textField.handleBlur()
            expect(textField.showValidationResults).to.be.false
        })

        it('should show validation results asynchronously on blur', () => {
            sandbox.stub(mobx, 'autorun').yields() // make it sync for test
            textField.handleBlur()
            expect(textField.showValidationResults).to.be.true
        })

        it('should have an observable value', () => {
            mobx.observe(textField, 'value', textObserver)
            textField.updateValue('newValue')
            expect(textObserver.firstCall.args[0].newValue).to.equal('newValue')
        })
    })

    describe('onFocus', () => {
        it('should be visited on focus', () => {
            textField.handleFocus()
            expect(textField.visited).to.be.true
        })
    })

    describe('when unbound', () => {
        dataDriven<{ property: keyof FieldStore<unknown> }>(
            [{ property: 'valid' }, { property: 'validating' }, { property: 'errorMessage' }, { property: 'changed' }, { property: 'required' }],
            () => {
                it('should fail when accessing the {property} property', (ctx: any) => {
                    expect(() => (textField as any)[ctx.property]).to.throw('Trying to use an unbound field')
                })

                it('should fail on reset()', () => {
                    expect(() => textField.reset('abcde')).to.throw('Trying to use an unbound field')
                })
            },
        )
    })

    describe('when bound', () => {
        let binding: any

        beforeEach(() => {
            binding = {
                changed: false,
                valid: true,
                customErrorMessage: 'some message',
                errorMessage: undefined,
                required: false,
                validating: false,
                setUnchanged: sinon.stub(),
            } as Partial<Binding<unknown, unknown>>

            textField.bind(binding)
        })

        dataDriven<{ property: keyof FieldStore<unknown> }>(
            [{ property: 'valid' }, { property: 'validating' }, { property: 'errorMessage' }, { property: 'changed' }, { property: 'required' }],
            () => {
                it('should return bound property values', () => {
                    expect(textField.changed).to.be.false
                    expect(textField.valid).to.be.true
                    expect(textField.errorMessage).to.be.undefined
                    expect(textField.required).to.be.false
                    expect(textField.validating).to.be.false
                })
            },
        )

        describe('reset', () => {
            it('should reset validation state', () => {
                textField.errorMessage = 'something'
                textField.reset('abcde')
                expect(textField.value).to.equal('abcde')
                expect(textField.showValidationResults).to.be.false
                expect(textField.visited).to.be.false
                expect(binding.setUnchanged).to.have.been.called
                expect(binding.customErrorMessage).to.be.undefined
            })
        })
    })
})
