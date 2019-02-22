import { DefaultContext } from '../model/DefaultBinder'

export default class BinderSamples {
    public static t(message: string, args?: { [ s: string ]: any }): string {
        const theArgs = args || {}
        const argsString = Object.keys(theArgs).map(key => `${key}=${theArgs[ key ]}`).join(',')

        return `${message}(${argsString})`
    }

    public static context(): DefaultContext {
        return new DefaultContext(BinderSamples.t)
    }
}
