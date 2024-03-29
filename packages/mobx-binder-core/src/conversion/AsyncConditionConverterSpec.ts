import {expect} from 'chai'
import sinon from 'sinon'

import {AsyncConditionalConverter} from './AsyncConditionalConverter'
import {ErrorMessage} from '../model/binder/SimpleBinder'

describe('AsyncConditionalConverter', () => {
    let conditionMock: any
    let inner: any
    let converter: AsyncConditionalConverter<ErrorMessage, string>

    beforeEach(() => {
        conditionMock = {
            matches: sinon.stub().returns(true),
        }
        inner = {
            convertToModel: sinon.stub().resolves('converted-to-model'),
            convertToPresentation: sinon.stub().returns('converted-to-presentation'),
            isEqual: sinon.stub().returns(false),
        }
        converter = new AsyncConditionalConverter(inner, conditionMock)
    })

    describe('convertToModel', () => {
        it('should delegate to the given converter if the condition matches', () => {
            return expect(converter.convertToModel('bla')).to.eventually.equal('converted-to-model')
        })

        it('should always delegate to the given converter if there is no condition', () => {
            converter = new AsyncConditionalConverter(inner, undefined)
            return expect(converter.convertToModel('bla')).to.eventually.equal('converted-to-model')
        })

        it('should not convert if the condition does not match', () => {
            conditionMock.matches.returns(false)
            return expect(converter.convertToModel('bla')).to.eventually.equal('bla')
        })
    })

    describe('convertToPresentation', () => {
        it('should delegate to the given converter if the condition matches', () => {
            expect(converter.convertToPresentation('bla')).to.equal('converted-to-presentation')
        })

        it('should always delegate to the given converter if there is no condition', () => {
            converter = new AsyncConditionalConverter(inner, undefined)
            expect(converter.convertToPresentation('bla')).to.equal('converted-to-presentation')
        })
        it('should not convert if the condition does not match', () => {
            conditionMock.matches.returns(false)
            expect(converter.convertToPresentation('bla')).to.equal('bla')
        })
    })

    describe('isEqual', () => {
        it('should delegate to the given converter if the condition matches', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(converter.isEqual('a', 'a')).to.be.false
        })

        it('should delegate to the given converter if there is no condition object', () => {
            converter = new AsyncConditionalConverter(inner, undefined)
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(converter.isEqual('a', 'a')).to.be.false
        })

        it('should not delegate but do a plain isEqual if the condition does not match', () => {
            conditionMock.matches.returns(false)
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(converter.isEqual('a', 'a')).to.be.true
        })

        it('should not delegate but do a plain isEqual there is no isEqual on the inner converter', () => {
            delete inner.isEqual
            conditionMock.matches.returns(false)
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(converter.isEqual('a', 'a')).to.be.true
        })
    })
})
