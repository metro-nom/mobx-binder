import { TextField } from '../../..'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'
import { ChangeEventHandler } from './ChangeEventHandler'
import { observable, runInAction } from 'mobx'
import sinon = require('sinon')

describe('ChangeEventHandler', () => {
    const sandbox = sinon.createSandbox()
    const context = new SimpleContext()
    let modifier: ChangeEventHandler<ErrorMessage, string>
    let field: TextField
    let upstream: any
    let callbackMock: any

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
        modifier = new ChangeEventHandler<ErrorMessage, string>(upstream, context, callbackMock)
    })

    describe('name', () => {
        it('should provide a name of the converter', () => {
            const myHandler = () => {
                /* do something */
            }
            modifier = new ChangeEventHandler<ErrorMessage, string>(upstream, context, myHandler)

            expect(modifier.name).to.equal('myHandler')
        })
    })

    describe('type', () => {
        it('should provide a type', () => {
            expect(modifier.type).to.equal('change event handler')
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

        it('should not trigger callback if value is pending', () => {
            runInAction(() => {
                field.touched = true
                upstream.data.value = 'newValue'
            })
            callbackMock.reset()
            runInAction(() => {
                field.touched = true
                upstream.data.pending = true
                upstream.data.value = 'newValue'
            })
            expect(callbackMock).to.not.have.been.called
        })
        it('should not trigger callback if value is invalid', () => {
            upstream.validity = {
                status: 'unknown',
            }
            runInAction(() => {
                field.touched = true
                upstream.data.value = 'newValue'
            })
            expect(callbackMock).to.not.have.been.called
        })
    })
})
