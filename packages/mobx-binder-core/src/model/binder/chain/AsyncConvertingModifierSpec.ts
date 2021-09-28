import { TextField } from '../../..'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'
import sleep from '../../../test/sleep'
import { AsyncConvertingModifier } from './AsyncConvertingModifier'
import { AsyncConverter } from '../../../conversion/Converter'
import { SimpleAsyncNumberConverter } from '../../../test/SimpleAsyncNumberConverter'
import sinon = require('sinon')

describe('AsyncConvertingModifier', () => {
    const sandbox = sinon.createSandbox()
    const context = new SimpleContext()
    let field: TextField
    let upstream: any
    let converter: AsyncConverter<ErrorMessage, string | undefined, number | undefined>
    let modifier: AsyncConvertingModifier<ErrorMessage, string | undefined, number | undefined>

    function createConverter(): SimpleAsyncNumberConverter {
        converter = new SimpleAsyncNumberConverter()
        sandbox.spy(converter, 'convertToModel')
        return converter
    }

    beforeEach(() => {
        field = new TextField('myField')
        upstream = {
            data: {
                pending: false,
                value: '123',
            },
            validity: {
                status: 'validated',
                result: undefined,
            },
            field,
            toView: sandbox.spy((value: any) => value),
            validateValue: sandbox.stub().callsFake(value => ({
                valid: true,
                value,
            })),
            isEqual: sandbox.stub().callsFake((a: any, b: any) => a === b),
            validateAsync: sandbox.stub().resolves({ status: 'validated', result: undefined }),
        }
        modifier = new AsyncConvertingModifier<ErrorMessage, string | undefined, number | undefined>(upstream, context, createConverter(), { onBlur: false })
    })

    describe('name', () => {
        it('should provide a name of the converter', () => {
            expect(modifier.name).to.equal('SimpleAsyncNumberConverter')
        })

        it('should support a label on the converter', () => {
            ;(converter as any).label = 'Some converter'
            expect(modifier.name).to.equal('Some converter')
        })
    })

    describe('type', () => {
        it('should provide a type', () => {
            expect(modifier.type).to.equal('async conversion')
        })
    })

    describe('data', () => {
        it('should convert valid upstream data', async () => {
            await modifier.validateAsync(false)
            expect(modifier.data).to.deep.equal({
                pending: false,
                value: 123,
            })
        })
        it('should pass through upstream data of unknown/pending validity as pending', () => {
            expect(modifier.data).to.deep.equal({
                pending: true,
            })
        })
        it('should pass through invalid upstream data as pending', async () => {
            upstream.data.value = 'wrong'
            await modifier.validateAsync(false)
            expect(modifier.data).to.deep.equal({
                pending: true,
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
    })

    describe('validity', () => {
        it('should return upstream validity if still unknown', () => {
            upstream.validity = { status: 'unknown' }
            expect(modifier.validity).to.deep.equal(upstream.validity)
        })
        it('should return upstream validity if still validating', () => {
            upstream.validity = { status: 'validating' }
            expect(modifier.validity).to.deep.equal(upstream.validity)
        })
        it('should return upstream validity if it failed', () => {
            upstream.validity = { status: 'validated', result: 'fail' }
            expect(modifier.validity).to.deep.equal(upstream.validity)
        })
        it('should return non-pending success if previous async validation succeeded', async () => {
            await modifier.validateAsync(false)
            expect(modifier.validity).to.deep.equal({
                status: 'validated',
                result: undefined,
            })
        })
        it('should return non-pending error if previous async validation failed', async () => {
            upstream.data.value = 'wrong'
            await modifier.validateAsync(false)
            expect(modifier.validity).to.deep.equal({
                status: 'validated',
                result: 'not a number',
            })
        })
        it('should ignore previous async validation for different values', async () => {
            upstream.data.value = 'wrong'
            await modifier.validateAsync(false)
            upstream.data.value = 'ok'
            expect(modifier.validity).to.deep.equal({
                status: 'unknown',
            })
        })
        it('should not start a new validation on two consecutive calls', async () => {
            await modifier.validateAsync(false)
            await modifier.validateAsync(false)
            expect(modifier.validity).to.deep.equal({
                status: 'validated',
                result: undefined,
            })
            expect(converter.convertToModel).to.have.been.calledOnce
        })
        it('should remember last validation result on two consecutive calls', async () => {
            upstream.data.value = 'wrong'
            await modifier.validateAsync(false)
            await modifier.validateAsync(false)
            expect(modifier.validity).to.deep.equal({
                status: 'validated',
                result: 'not a number',
            })
            expect(converter.convertToModel).to.have.been.calledOnce
        })
        it('should start new validation if previous value was different', async () => {
            upstream.data.value = 'wrong'
            const promise = modifier.validateAsync(false)
            upstream.data.value = 'ok'
            await modifier.validateAsync(false)
            expect(converter.convertToModel).to.have.been.calledTwice
            await promise // cleanup
        })
        it('should not apply validation results if value changed before validation finished', async () => {
            upstream.data.value = 'wrong'
            const validationPromise = modifier.validateAsync(false)
            await sleep(5)
            upstream.data.value = 'ok'
            await validationPromise
            expect(modifier.validity).to.deep.equal({
                status: 'unknown',
            })
        })
        it('should return unknown validity if validation did not yet start', () => {
            expect(modifier.validity).to.deep.equal({
                status: 'unknown',
            })
        })
        it('should have pending validity if validation is ongoing', async () => {
            const promise = modifier.validateAsync(false)
            await sleep(5)
            expect(modifier.validity).to.deep.equal({
                status: 'validating',
            })
            await promise // for cleanup
        })
        it('should fail on any unexpected error', () => {
            upstream.data.value = 'internal error'
            return modifier.validateAsync(false).should.have.been.rejectedWith('fail on internal error')
        })

        it('should return pending validity if it is not itself validating but previous validation is still in progress', async () => {
            const promise = modifier.validateAsync(false)
            await sleep(5)
            expect(await modifier.validateAsync(true)).to.deep.equal({
                status: 'validating',
            })
            await promise // for cleanup
        })

        describe('onBlur', () => {
            it('should not validate on blur if not configured', async () => {
                await modifier.validateAsync(true)
                expect(modifier.validity).to.deep.equal({
                    status: 'unknown',
                })
            })

            it('should validate on blur if configured', async () => {
                modifier = new AsyncConvertingModifier<ErrorMessage, string | undefined, number | undefined>(upstream, context, createConverter(), {
                    onBlur: true,
                })
                await modifier.validateAsync(true)
                expect(modifier.validity).to.deep.equal({
                    status: 'validated',
                    result: undefined,
                })
            })
        })
    })

    describe('toView', () => {
        it('should pass converted presentation value to upstream.toView()', () => {
            expect(modifier.toView(123)).to.equal('123')
            expect(upstream.toView).to.have.been.calledWith('123')
        })
    })

    describe('isEqual', () => {
        it('should just delegate to the upstream modifier by default', () => {
            upstream.isEqual.withArgs(123, 123).returns(true)
            upstream.isEqual.withArgs(123, 456).returns(false)

            expect(modifier.isEqual(123, 123)).to.be.true
            expect(modifier.isEqual(123, 456)).to.be.false

            expect(upstream.isEqual).to.have.been.calledTwice
        })

        it('should delegate to the converter isEqual method if existing', () => {
            const stub = (converter.isEqual = sandbox.stub())
            upstream.isEqual = () => {
                throw new Error('should not be called')
            }

            stub.withArgs(123, 123).returns(true)
            stub.withArgs(123, 456).returns(false)

            expect(modifier.isEqual(123, 123)).to.be.true
            expect(modifier.isEqual(123, 456)).to.be.false

            expect(stub).to.have.been.calledTwice
        })
    })

    describe('validateValue', () => {
        // here I only test cases where the superclass delegates to validateValueLocally()

        it('should accept valid values', async () => {
            expect(await modifier.validateValue('123')).to.deep.equal({
                valid: true,
                value: 123,
            })
        })
        it('should return proper validation result on validation errors', async () => {
            expect(await modifier.validateValue('wrong')).to.deep.equal({
                valid: false,
                result: 'not a number',
            })
        })
        it('should fail on any unexpected error', () => {
            return modifier.validateValue('internal error').should.have.been.rejectedWith('fail on internal error')
        })
    })
})
