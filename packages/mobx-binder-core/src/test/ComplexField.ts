import { makeObservable, observable } from 'mobx'
import { AbstractField } from '..'

export class ComplexField extends AbstractField<string[]> {
    public value: string[] = []

    public constructor(name: string) {
        super('string[]', name)

        makeObservable(this, {
            value: observable.ref,
        })
    }
}
