import 'react'
import { TranslateFunction } from 'react-mobx-i18n'

declare module 'react' {
    interface Component {
        t: TranslateFunction
    }
}
