export interface Translations {
    [translationKey: string]: string
}

export interface Locales {
    [languageKey: string]: Translations
}
