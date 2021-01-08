import { makeObservable, observable } from 'mobx'
import { AbstractField } from './AbstractField'

export class TextField extends AbstractField<string> {
    public value = ''

    public constructor(name: string) {
        super('string', name)

        makeObservable(this, { value: observable })
    }
}
