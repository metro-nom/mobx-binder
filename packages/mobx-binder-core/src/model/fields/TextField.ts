import { observable } from 'mobx'
import { AbstractField } from './AbstractField'

export class TextField extends AbstractField<string> {
    @observable
    public value = ''

    public constructor(name: string) {
        super('string', name)
    }
}
