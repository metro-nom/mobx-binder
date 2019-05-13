import { TextField } from '../../..'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'
import { AsyncValidatingModifier } from './AsyncValidatingModifier'
import sleep from '../../../test/sleep'
import sinon = require('sinon')

describe('AsyncValidatingModifier', () => {
    const sandbox = sinon.createSandbox()
    const context = new SimpleContext()
    let field: TextField
    let upstream: any
    let validatorMock: any
    let modifier: AsyncValidatingModifier<ErrorMessage, string>

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
            toView: sandbox.stub(),
            validateAsync: sandbox.stub().resolves({ status: 'validated', result: undefined }),
        }
        validatorMock = sandbox.spy(async (value: string) => {
            await sleep(10)
            return value === 'wrong' ? 'fail' : undefined
        })
        modifier = new AsyncValidatingModifier<ErrorMessage, string>(upstream, context, validatorMock, { onBlur: false })
    })

    describe('data', () => {
        it('should pass through valid upstream data', async () => {
            await modifier.validateAsync(false)
            expect(modifier.data).to.deep.equal({
                pending: false,
                value: 'myValue',
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
                result: 'fail',
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
        it('should return pending validity if validation is ongoing', async () => {
            const promise = modifier.validateAsync(false)
            await sleep(5)
            expect(modifier.validity).to.deep.equal({
                status: 'validating',
            })
            await promise
        })

        describe('onBlur', () => {
            it('should not validate on blur if not configured', async () => {
                await modifier.validateAsync(true)
                expect(modifier.validity).to.deep.equal({
                    status: 'unknown',
                })
            })

            it('should validate on blur if configured', async () => {
                modifier = new AsyncValidatingModifier<ErrorMessage, string>(upstream, context, validatorMock, { onBlur: true })
                await modifier.validateAsync(true)
                expect(modifier.validity).to.deep.equal({
                    status: 'validated',
                    result: undefined,
                })
            })
        })
    })
})
