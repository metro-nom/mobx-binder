export default class BinderSamples {
    public static t(message: string, args: { [s: string]: any } = {}): string {
        const argsString = Object.keys(args)
            .map(key => `${key}=${args[key]}`)
            .join(',')

        return `${message}(${argsString})`
    }
}
