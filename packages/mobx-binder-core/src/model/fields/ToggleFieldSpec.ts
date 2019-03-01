import { expect } from 'chai'
import { ToggleField } from './ToggleField'
import * as sinon from 'sinon'
import { observe } from 'mobx'

describe('ToggleField', () => {
    const sandbox = sinon.createSandbox()

    let toggleField: ToggleField
    let toggleObserver: sinon.SinonStub

    beforeEach(() => {
        toggleField = new ToggleField('emailPermission')
        toggleObserver = sandbox.stub()
    })

    describe('initial value', () => {
        it('should have a name', () => {
            expect(toggleField.name).to.equal('emailPermission')
        })

        it('should have an initially empty value', () => {
            expect(toggleField.value).to.equal(false)
        })
    })

    describe('editing', () => {
        it('should allow to change a value', () => {
            toggleField.updateValue(true)
            expect(toggleField.value).to.equal(true)
        })

        it('should allow to toggle the value', () => {
            toggleField.toggle()
            expect(toggleField.value).to.equal(true)
        })

        it('should have an observable value', () => {
            observe(toggleField, 'value', toggleObserver)
            toggleField.updateValue(true)
            expect(toggleObserver.firstCall.args[0].newValue).to.equal(true)
        })
    })

    describe('onBlur', () => {
        it('should show validation results on blur', () => {
            toggleField.handleBlur()
            expect(toggleField.showValidationResults).to.be.true
        })

        it('should have an observable value', () => {
            observe(toggleField, 'value', toggleObserver)
            toggleField.updateValue(true)
            expect(toggleObserver.firstCall.args[0].newValue).to.equal(true)
        })
    })

    describe('reset', () => {
        it('should reset validation state', () => {
            toggleField.reset(false)
            expect(toggleField.value).to.equal(false)
            expect(toggleField.showValidationResults).to.be.false
            expect(toggleField.errorMessage).to.be.undefined
        })
    })
})
