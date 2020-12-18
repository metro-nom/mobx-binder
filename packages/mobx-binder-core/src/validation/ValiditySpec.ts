import { expect } from 'chai'
import { isValidated, Validity } from './Validity'

describe('Validity', () => {
    describe('isValidated', () => {
        it('should type narrow to KnownValidity if validated', () => {
            const validity: Validity<string> = { status: 'validated', result: 'done' }
            expect(isValidated(validity) && validity.result === 'done').to.be.true
        })
        it('should return false if not yet validated ', () => {
            expect(isValidated({ status: 'unknown' })).to.be.false
            expect(isValidated({ status: 'validating' })).to.be.false
        })
    })
})
