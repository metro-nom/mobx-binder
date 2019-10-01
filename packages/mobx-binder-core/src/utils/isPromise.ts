export function isPromise<T>(elem: T | Promise<T>): elem is Promise<T> {
    return !!(elem as Promise<T>).then
}
