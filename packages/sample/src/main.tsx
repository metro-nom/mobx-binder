import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { configure } from 'mobx'
import { Provider } from 'mobx-react'
import { App } from 'app'
import PersonStore from './app/domain/PersonStore'
import ProfileStore from './app/pages/profile/ProfileStore'
import I18nStore from './app/i18n/I18nStore'

// tslint:disable no-submodule-imports

import 'bootstrap/dist/css/bootstrap.css'
import { DefaultContext } from 'mobx-binder'

// enable MobX strict mode
configure({ enforceActions: 'observed' })

const i18n = new I18nStore('en', {
    en: {
        'form.fields.fullName': 'Full name',
        'form.fields.dateOfBirth': 'Date of birth',
        'form.fields.phoneNumber': 'Phone number',
        'form.fields.email': 'E-mail',
        'profilePage.saveButton.label': 'Save',
        'validations.required': 'Please enter something',
        'validations.email': 'Please enter a valid email address',
    },
})

// Binder context
const binderContext = new DefaultContext(i18n.translate)

// prepare MobX stores
const personStore = new PersonStore()
const profileStore = new ProfileStore(personStore, binderContext)
const stores = { i18n, personStore, profileStore }

// render react DOM
ReactDOM.render(
    <Provider { ...stores } >
        <App />
    </Provider>,
    document.getElementById('root')
)
