import { TextField } from '../../..'
import { ErrorMessage, SimpleContext } from '../SimpleBinder'
import { expect } from 'chai'
import { observable } from 'mobx'
import { AbstractModifier } from './AbstractModifier'
import sinon = require('sinon')

describe('AbstractModifier', () => {
    const sandbox = sinon.createSandbox()
    const context = new SimpleContext()
    let field: TextField
    let upstream: any
    let modifier: AbstractModifier<ErrorMessage, string, string>

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
        modifier = new AbstractModifier<ErrorMessage, string, string>(upstream, context)
    })

    describe('data', () => {
        it('should pass through any upstream data', () => {
            expect(modifier.data).to.deep.equal({
                pending: false,
                value: 'myValue',
            })
        })
    })

    describe('validity', () => {
        it('should pass through any validity', () => {
            expect(modifier.validity).to.deep.equal({
                status: 'validated',
                result: undefined,
            })
        })
    })

    describe('validateAsync', () => {
        it('should perform upstream validation and return results', async () => {
            upstream.validateAsync = sandbox.stub().withArgs(false).resolves({
                status: 'validated',
                result: undefined,
            })
            expect(await modifier.validateAsync(false)).to.deep.equal({
                status: 'validated',
                result: undefined,
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
