import { expect } from 'chai'
import I18nStore from './I18nStore'
import { Locales } from './Locales'

describe('I18nStore', () => {
    let store: I18nStore
    const locales: Locales = {
        en: {
            'prefix.validations.email': 'Please enter a valid e-mail address.'
        },
        keys: {}
    }

    beforeEach(() => {
        store = new I18nStore('en', locales)
    })

    describe('translate', () => {
        it('should provide translation function for the configured locale', () => {
            expect(store.translate('prefix.validations.email')).to.equal('Please enter a valid e-mail address.')
        })

        it('should translate differently after locale change', () => {
            store.locale = 'abc'
            expect(store.translate('validations.email')).to.equal('abc: validations.email')
        })
    })
})
