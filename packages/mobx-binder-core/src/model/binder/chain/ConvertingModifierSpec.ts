import { Converter, TextField } from '../../..'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'
import { ConvertingModifier } from './ConvertingModifier'
import { SimpleNumberConverter } from '../../../test/SimpleNumberConverter'
import sinon = require('sinon')

describe('ConvertingModifier', () => {
    const sandbox = sinon.createSandbox()
    const context = new SimpleContext()
    let field: TextField
    let upstream: any
    let converter: Converter<ErrorMessage, string, number>
    let modifier: ConvertingModifier<ErrorMessage, string, number>

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
        }
        converter = new SimpleNumberConverter()
        modifier = new ConvertingModifier(upstream, converter, context)
    })

    describe('data', () => {
        it('should convert valid upstream data', () => {
            expect(modifier.data).to.deep.equal({
                pending: false,
                value: 123,
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
            upstream.data.value = 'abc'
            expect(modifier.data).to.deep.equal({
                pending: true,
            })
        })
        it('should fail on unexpected errors', () => {
            const error = new Error('fail')
            converter.convertToModel = () => { throw error }
            expect(() => modifier.data).to.throw(error)
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
            upstream.data = { pending: false, value: 'abc' }
            expect(modifier.validity).to.deep.equal({
                status: 'validated',
                result: 'Not a number',
            })
        })
        it('should fail with error on unexpected errors', () => {
            const error = new Error('fail')
            converter.convertToModel = () => { throw error }
            expect(() => modifier.validity).to.throw(error)
        })
    })

    describe('toView', () => {
        it('should pass converted presentation value to upstream.toView()', () => {
            expect(modifier.toView(123)).to.equal('123')
            expect(upstream.toView).to.have.been.calledWith('123')
        })
    })
})
