import { TextField, ValidationError } from '../../..'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'
import sleep from '../../../test/sleep'
import { AsyncConvertingModifier } from './AsyncConvertingModifier'
import { AsyncConverter } from '../../../conversion/Converter'
import sinon = require('sinon')

class SampleAsyncConverter implements AsyncConverter<ErrorMessage, string, number> {
    public async convertToModel(value?: string): Promise<number> {
        await sleep(10)

        const modelValue = Number(value)
        if (isNaN(modelValue)) {
            throw new ValidationError('not a number')
        }
        return Number(value)
    }

    public convertToPresentation(data?: number): string {
        return `${data}`
    }
}

describe('AsyncConvertingModifier', () => {
    const sandbox = sinon.createSandbox()
    const context = new SimpleContext()
    let field: TextField
    let upstream: any
    let converter: SampleAsyncConverter
    let modifier: AsyncConvertingModifier<ErrorMessage, string, number>

    function createConverter(): SampleAsyncConverter {
        converter = new SampleAsyncConverter()
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
            toView: sandbox.stub(),
            validateValue: sandbox.stub().callsFake(value => ({
                valid: true,
                value,
            })),
            isEqual: (a: any, b: any) => a === b,
            validateAsync: sandbox.stub().resolves({ status: 'validated', result: undefined }),
        }
        modifier = new AsyncConvertingModifier<ErrorMessage, string, number>(upstream, context, createConverter(), { onBlur: false })
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
                modifier = new AsyncConvertingModifier<ErrorMessage, string, number>(upstream, context, createConverter(), { onBlur: true })
                await modifier.validateAsync(true)
                expect(modifier.validity).to.deep.equal({
                    status: 'validated',
                    result: undefined,
                })
            })
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
    })
})
