declare module 'react-mobx-i18n' {
    import { IReactComponent } from 'mobx-react'

    namespace Main {
        export function translatable<T extends IReactComponent>(target: T): T

        export function init(cb: () => void): {
            i18n: any
        }

        export type TranslateFunction = (translationKey: string, args?: any) => string

        export function tFactory(store: { locale: string }): TranslateFunction
    }

    export = Main
}
