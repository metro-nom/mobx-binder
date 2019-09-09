import React from 'react'
import ReactDOM from 'react-dom'
import { configure } from 'mobx'
import { Provider } from 'mobx-react'
import { App } from 'app'
import PersonStore from './app/domain/PersonStore'
import ProfileStore from './app/pages/profile/ProfileStore'
import I18nStore from './app/i18n/I18nStore'

// tslint:disable no-submodule-imports

import 'bootstrap/dist/css/bootstrap.css'

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
const stores = { i18n, personStore, profileStore }

// render react DOM
ReactDOM.render(
    <Provider { ...stores } >
        <App />
    </Provider>,
    document.getElementById('root')
)
