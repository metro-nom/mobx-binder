import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { App } from 'app'
import { stores } from './stores'

// tslint:disable no-submodule-imports
import 'bootstrap/dist/css/bootstrap.css'

// render react DOM
ReactDOM.render(
    <Provider {...stores}>
        <App />
    </Provider>,
    document.getElementById('root'),
)
