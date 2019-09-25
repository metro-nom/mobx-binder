import { observable } from 'mobx'
import { init, tFactory, TranslateFunction } from 'react-mobx-i18n'
import i18n from 'i18n-harmony'
import { Locales } from './Locales'

export default class I18nStore {
    @observable
    public locale = 'en'

    public translate: TranslateFunction

    constructor(defaultLocale: string, translations: Locales) {
        i18n.init({ translations })

        this.locale = defaultLocale
        init(() => ({ i18n: this }))

        this.translate = tFactory(this)
    }
}
