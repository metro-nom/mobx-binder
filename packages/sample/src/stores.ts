import { configure } from 'mobx'
import PersonStore from './app/domain/PersonStore'
import ProfileStore from './app/pages/profile/ProfileStore'
import I18nStore from './app/i18n/I18nStore'
import * as React from 'react'

// enable MobX strict mode
configure({ enforceActions: 'observed' })

const i18n = new I18nStore('en', {
    en: {
        'form.fields.fullName': 'Full name',
        'form.fields.dateOfBirth': 'Date of birth',
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

// prepare MobX stores
const personStore = new PersonStore()
const profileStore = new ProfileStore(personStore, i18n.translate)

export const stores = { i18n, personStore, profileStore }

export const I18nContext = React.createContext(i18n)
export const PersonContext = React.createContext(personStore)
export const ProfileContext = React.createContext(profileStore)
