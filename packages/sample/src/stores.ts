import { configure } from 'mobx'
import PersonStore from './app/domain/PersonStore'
import ProfileStore from './app/pages/profile/ProfileStore'
import I18nStore from './app/i18n/I18nStore'
import * as React from 'react'

// enable MobX strict mode
configure({
    enforceActions: 'observed',
    computedRequiresReaction: true,
    reactionRequiresObservable: true,
    observableRequiresReaction: true,
    disableErrorBoundaries: true,
})

// prepare MobX stores
const i18n = new I18nStore('en', {
    en: {
        'form.fields.fullName': 'Full name',
        'form.fields.dateOfBirth': 'Date of birth',
        'form.fields.anotherDate': 'Another date',
        'form.fields.phoneNumber': 'Phone number',
        'form.fields.email': 'E-mail',
        'form.fields.toggle': 'Please toggle',
        'profilePage.saveButton.label': 'Save',
        'validations.fullName.submissionError': 'The full name seems to be wrong due to server side validation',
        'validations.required': 'Please enter something',
        'validations.email': 'Please enter a valid email address',
        'conversions.error.moment': 'Please enter a valid date',
    },
})
const personStore = new PersonStore()
const profileStore = new ProfileStore(personStore, i18n.translate)

export const stores = { i18n, personStore, profileStore }

const StoresContext = React.createContext(stores)

// Expose stores
export const StoresProvider = StoresContext.Provider
export const useStores = () => React.useContext(StoresContext)
