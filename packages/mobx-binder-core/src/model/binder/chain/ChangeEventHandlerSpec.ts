import { TextField } from '../../..'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'
import { ChangeEventHandler } from './ChangeEventHandler'
import { observable, runInAction } from 'mobx'
import sinon = require('sinon')

describe('ValidatingModifier', () => {
    const sandbox = sinon.createSandbox()
    const context = new SimpleContext()
    let field: TextField
    let upstream: any
    let callbackMock: any
    let handler: ChangeEventHandler<ErrorMessage, string>

    beforeEach(() => {
        field = new TextField('myField')
        upstream = {
            data: observable({
                pending: false,
                value: 'myValue',
            }),
            validity: {
                status: 'validated',
                result: undefined,
            },
            field,
            toView: sandbox.spy((value: any) => value),
        }
        callbackMock = sandbox.stub()
        handler = new ChangeEventHandler<ErrorMessage, string>(upstream, context, callbackMock)
    })

    describe('data', () => {
        it('should pass through any upstream data', () => {
            expect(handler.data).to.deep.equal({
                pending: false,
                value: 'myValue',
            })
        })
    })

    describe('validity', () => {
        it('should pass through any validity', () => {
            expect(handler.validity).to.deep.equal({
                status: 'validated',
                result: undefined,
            })
        })
    })

    describe('handle change', () => {
        it('should trigger callback on value change', () => {
            runInAction(() => {
                field.touched = true
                upstream.data.value = 'newValue'
            })
            expect(callbackMock).to.have.been.calledWith('newValue')
        })

        it('should not trigger callback if field is not touched', () => {
            runInAction(() => {
                field.touched = false
                upstream.data.value = 'newValue'
            })
            expect(callbackMock).to.not.have.been.called
        })
    })
})
