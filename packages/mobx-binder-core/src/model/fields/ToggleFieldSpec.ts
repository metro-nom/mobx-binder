import { expect } from 'chai'
import { ToggleField } from './ToggleField'
import sinon from 'sinon'
import * as mobx from 'mobx'

describe('ToggleField', () => {
    const sandbox = sinon.createSandbox()

    let toggleField: ToggleField
    let toggleObserver: sinon.SinonStub

    beforeEach(() => {
        toggleField = new ToggleField('emailPermission')
        toggleObserver = sandbox.stub()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('initial value', () => {
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
            mobx.observe(toggleField, 'value', toggleObserver)
            toggleField.updateValue(true)
            expect(toggleObserver.firstCall.args[0].newValue).to.equal(true)
        })
    })
})
