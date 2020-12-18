import { expect } from 'chai'
import { isValidationError, ValidationError } from './ValidationError'

describe('ValidationError', () => {
    it('should provide access to a ValidationReult', () => {
        expect(new ValidationError('result').validationResult).to.equal('result')
    })

    describe('isValidationError', () => {
        it('should type narrow to a valid ValidationError', () => {
            const error: Error = new ValidationError('result')
            expect(isValidationError(error) && error.validationResult == 'result').to.be.true
        })

        it('should detect if some error is not a validationError', () => {
            expect(isValidationError(new Error('other'))).to.be.false
        })
    })
})
