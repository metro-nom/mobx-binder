declare module 'react-mobx-i18n' {
    namespace Main {
        export function translatable<T extends React.Component<any, any, any>>(target: T): T

        export function init(
            cb: () => void,
        ): {
            i18n: any
        }

        export type TranslateFunction = (translationKey: string, args?: any) => string

        export function tFactory(store: { locale: string }): TranslateFunction
    }

    export = Main
}
