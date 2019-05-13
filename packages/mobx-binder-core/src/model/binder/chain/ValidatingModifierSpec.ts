import { TextField } from '../../..'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'
import { ValidatingModifier } from './ValidatingModifier'
import sinon = require('sinon')

describe('ValidatingModifier', () => {
    const sandbox = sinon.createSandbox()
    const context = new SimpleContext()
    let field: TextField
    let upstream: any
    let validatorMock: any
    let modifier: ValidatingModifier<ErrorMessage, string>

    beforeEach(() => {
        field = new TextField('myField')
        upstream = {
            data: {
                pending: false,
                value: 'myValue',
            },
            validity: {
                status: 'validated',
                result: undefined,
            },
            field,
            toView: sandbox.spy((value: any) => value),
        }
        validatorMock = sandbox.stub()
        modifier = new ValidatingModifier<ErrorMessage, string>(upstream, validatorMock, context)
    })

    describe('data', () => {
        it('should pass through valid upstream data', () => {
            expect(modifier.data).to.deep.equal({
                pending: false,
                value: 'myValue',
            })
        })
        it('should pass through pending upstream data', () => {
            upstream.data = {
                pending: true,
            }
            expect(modifier.data).to.deep.equal({
                pending: true,
            })
        })
        it('should return invalid data as pending', () => {
            validatorMock.withArgs('myValue').returns('fail')
            expect(modifier.data).to.deep.equal({
                pending: true,
            })
        })
    })

    describe('validity', () => {
        it('should return upstream validity if still unknown', () => {
            upstream.validity = { status: 'unknown' }
            expect(modifier.validity).to.deep.equal({
                status: 'unknown',
            })
        })
        it('should return upstream validity if still validating', () => {
            upstream.validity = { status: 'validating' }
            expect(modifier.validity).to.deep.equal({
                status: 'validating',
            })
        })
        it('should return non-pending validity if validation succeeds', () => {
            expect(modifier.validity).to.deep.equal({
                status: 'validated',
                result: undefined,
            })
        })
        it('should return non-pending error message if invalid', () => {
            validatorMock.withArgs('myValue').returns('fail')
            expect(modifier.validity).to.deep.equal({
                status: 'validated',
                result: 'fail',
            })
        })
    })

    describe('toView', () => {
        it('should pass unchanged value to upstream.toView()', () => {
            expect(modifier.toView('abc')).to.equal('abc')
            expect(upstream.toView).to.have.been.calledWith('abc')
        })
    })
})
