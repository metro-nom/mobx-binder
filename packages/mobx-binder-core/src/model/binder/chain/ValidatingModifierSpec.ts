import { TextField } from '../../..'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'
import { ValidatingModifier } from './ValidatingModifier'
import sinon = require('sinon')
import { wrapRequiredValidator } from '../../../validation/WrappedValidator'

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
            required: false,
            validity: {
                status: 'validated',
                result: undefined,
            },
            field,
            validateAsync: sandbox.stub().resolves({
                status: 'validated',
                result: undefined,
            }),
            validateValue: sandbox.stub().callsFake(value => ({
                valid: true,
                value,
            })),
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
        it('should pass through valid upstream data when the own validation is disabled', () => {
            modifier = new ValidatingModifier<ErrorMessage, string>(
                upstream,
                context,
                wrapRequiredValidator(
                    () => 'abc',
                    () => false,
                ),
            )
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

    describe('required', () => {
        it('should return upstream required by default', () => {
            expect(modifier.required).to.be.false
        })

        it('should mark a field as required if the RequiredValidator is active', () => {
            modifier = new ValidatingModifier<ErrorMessage, string>(
                upstream,
                context,
                wrapRequiredValidator(
                    () => 'abc',
                    () => true,
                ),
            )
            expect(modifier.required).to.be.true
        })

        it('should not mark a field as required if the RequiredValidator is inactive', () => {
            upstream.required = true
            modifier = new ValidatingModifier<ErrorMessage, string>(
                upstream,
                context,
                wrapRequiredValidator(
                    () => 'abc',
                    () => false,
                ),
            )
            expect(modifier.required).to.be.false
        })
    })

    describe('validity', () => {
        it('should return upstream validity if still unknown', () => {
            upstream.validity = { status: 'unknown' }
            expect(modifier.validity).to.deep.equal({
                status: 'unknown',
            })
        })
        it('should return unknown validity if value is pending', () => {
            upstream.data.pending = true
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
        it('should not validate a field if the RequiredValidator is inactive', () => {
            upstream.required = true
            modifier = new ValidatingModifier<ErrorMessage, string>(
                upstream,
                context,
                wrapRequiredValidator(
                    () => 'fail',
                    () => false,
                ),
            )
            expect(modifier.validity).to.deep.equal({
                status: 'validated',
                result: undefined,
            })
        })
        it('should handle missing required condition as trueish', () => {
            upstream.required = false
            modifier = new ValidatingModifier<ErrorMessage, string>(
                upstream,
                context,
                wrapRequiredValidator(() => 'fail'),
            )
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

    describe('validateValue', () => {
        // here I only test cases where the superclass delegates to validateValueLocally()

        it('should accept valid values', () => {
            expect(modifier.validateValue('someValue')).to.deep.equal({
                valid: true,
                value: 'someValue',
            })
        })
        it('should return proper validation result on validation errors', () => {
            validatorMock.withArgs('someValue').returns('failure')
            expect(modifier.validateValue('someValue')).to.deep.equal({
                valid: false,
                result: 'failure',
            })
        })
    })
})
