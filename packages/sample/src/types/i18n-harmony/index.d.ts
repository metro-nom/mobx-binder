declare module 'i18n-harmony' {
    export interface InternationalisationHarmonyConfig {
        translations: {
            [langKey: string]: {
                [translationKey: string]: string
            }
        }
        preProcessor?: (key: string, args?: any[], locale?: string) => string
        postProcessor?: (text: string) => string
    }

    export function init(config: InternationalisationHarmonyConfig): void

    export type TranslateFunction = (key: string, args?: any, language?: string) => string

    export function t(key: ststatsring, args?: any, language?: string): string
}
