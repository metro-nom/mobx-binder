import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { App } from 'app'

// tslint:disable no-submodule-imports

import 'bootstrap/dist/css/bootstrap.css'
import { stores } from './stores'

// render react DOM
ReactDOM.render(
    <Provider {...stores}>
        <App />
    </Provider>,
    document.getElementById('root'),
)
