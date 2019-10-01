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
            toView: sandbox.stub().returnsArg(0),
            validateValue: sandbox.stub(),
            applyConversionsToField: sandbox.stub(),
            isEqual: sandbox.stub(),
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
            upstream.validateAsync = sandbox
                .stub()
                .withArgs(false)
                .resolves({
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

    describe('validateValue', () => {
        const validResult = {
            valid: true,
            value: 'someValue',
        }
        const invalidResult = {
            valid: false,
            result: 'Some error',
        }
        const localStub = () => sandbox.stub(modifier as any, 'validateValueLocally')

        it('should directly return invalid sync view results', () => {
            const theLocalStub = localStub()
            upstream.validateValue.withArgs('someValue').returns(invalidResult)
            expect(modifier.validateValue('someValue')).to.equal(invalidResult)
            expect(theLocalStub).to.not.have.been.called
        })
        it('should directly return invalid async view results', async () => {
            const theLocalStub = localStub()
            upstream.validateValue.withArgs('someValue').resolves(invalidResult)
            expect(await modifier.validateValue('someValue')).to.equal(invalidResult)
            expect(theLocalStub).to.not.have.been.called
        })
        it('should delegate valid sync result to validateValue', () => {
            upstream.validateValue.withArgs('someValue').returns(validResult)
            localStub()
                .withArgs(validResult)
                .returns(invalidResult)
            expect(modifier.validateValue('someValue')).to.equal(invalidResult)
        })
        it('should delegate valid async result to validateValue', async () => {
            upstream.validateValue.withArgs('someValue').resolves(validResult)
            localStub()
                .withArgs(validResult)
                .returns(invalidResult)
            expect(await modifier.validateValue('someValue')).to.equal(invalidResult)
        })
        it('should return valid sync view results by default', () => {
            upstream.validateValue.withArgs('someValue').returns(validResult)
            expect(modifier.validateValue('someValue')).to.equal(validResult)
        })
        it('should return valid async view results by default', async () => {
            upstream.validateValue.withArgs('someValue').resolves(validResult)
            expect(await modifier.validateValue('someValue')).to.equal(validResult)
        })
    })

    describe('applyConversionsToField', () => {
        it('should write back converted value to the field if own model value is valid', () => {
            upstream.toView.withArgs('myValue').returns('123')
            modifier.applyConversionsToField()
            expect(field.value).to.equal('123')
            expect(upstream.applyConversionsToField).to.not.have.been.called
        })
        it('should call upstream apply method if data is not valid', () => {
            upstream.validity = {
                status: 'validated',
                result: 'error',
            }
            modifier.applyConversionsToField()
            expect(upstream.applyConversionsToField).to.have.been.called
        })
    })

    describe('isEqual', () => {
        it('should just delegate to the upstream modifier by default', () => {
            upstream.isEqual.withArgs('abc', 'abc').returns(true)
            upstream.isEqual.withArgs('abc', 'def').returns(false)

            expect(modifier.isEqual('abc', 'abc')).to.be.true
            expect(modifier.isEqual('abc', 'def')).to.be.false
        })
    })
})
