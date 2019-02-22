import { expect } from 'chai'

import { EmailValidator } from './EmailValidator'

describe('Validators', () => {

    it('should accept a valid email', () => {
        expect(EmailValidator.validate()('max.mustermann@metro.de')).to.deep.equal({})
    })

    it('should reject an invalid email', () => {
        expect(EmailValidator.validate()('max.mustermann metro.de')).to.deep.equal({
            messageKey: 'validations.email',
            args: { value: 'max.mustermann metro.de' }
        })
    })
})
