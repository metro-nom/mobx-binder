import { observable } from 'mobx'
import AbstractField from './AbstractField'

export class TextField extends AbstractField<string> {
    @observable
    public value: string = ''

    public constructor(name: string) {
        super('string', name)
    }
}
