import { action, makeObservable, observable } from 'mobx'
import i18n from 'i18n-harmony'
import { Locales } from './Locales'
import { TranslateFunction } from 'mobx-binder'

export default class I18nStore {
    public locale = 'en'

    constructor(defaultLocale: string, translations: Locales) {
        i18n.init({ translations })

        this.locale = defaultLocale

        makeObservable(this, {
            locale: observable,
            select: action,
        })
    }

    public t: TranslateFunction = (translationKey, args) => i18n.t(translationKey, args, this.locale)

    public select = (newLocale: string) => {
        this.locale = newLocale
    }
}
