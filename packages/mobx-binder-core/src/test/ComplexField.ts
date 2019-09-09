import { observable } from 'mobx'
import { AbstractField } from '..'

export class ComplexField extends AbstractField<string[]> {
    @observable.ref
    public value: string[] = []

    public constructor(name: string) {
        super('string[]', name)
    }
}
