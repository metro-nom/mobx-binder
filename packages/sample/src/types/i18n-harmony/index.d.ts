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

    export function t(key: string, args?: any, language?: string): string
}
