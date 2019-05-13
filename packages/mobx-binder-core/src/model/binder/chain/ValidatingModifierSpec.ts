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
            validateAsync: sandbox.stub().resolves({
                status: 'validated',
                result: undefined,
            }),
            toView: sandbox.spy((value: any) => value),
        }
        validatorMock = sandbox.stub()
        modifier = new ValidatingModifier<ErrorMessage, string>(upstream, context, validatorMock)
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

    describe('validateAsync', () => {
        it('should return upstream validity if still unknown', async () => {
            upstream.validateAsync.withArgs(false).resolves({ status: 'unknown' })
            expect(await modifier.validateAsync(false)).to.deep.equal({
                status: 'unknown',
            })
        })
        it('should return upstream validity if still validating', async () => {
            upstream.validateAsync.withArgs(false).resolves({ status: 'validating' })
            expect(await modifier.validateAsync(false)).to.deep.equal({
                status: 'validating',
            })
        })
        it('should return non-pending validity if validation succeeds', async () => {
            expect(await modifier.validateAsync(false)).to.deep.equal({
                status: 'validated',
                result: undefined,
            })
        })
        it('should return non-pending error message if invalid', async () => {
            validatorMock.withArgs('myValue').returns('fail')
            expect(await modifier.validateAsync(false)).to.deep.equal({
                status: 'validated',
                result: 'fail',
            })
        })
    })
})
