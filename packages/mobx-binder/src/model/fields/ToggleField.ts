import { action, observable } from 'mobx'
import { FieldStore } from './FieldStore'
import AbstractField from './AbstractField'

/*
    `name`: the immutable field name
    `value`: the frontend textfield value
    `data`: the backend boolean value
 */
export class ToggleField extends AbstractField<boolean> {
    @observable
    public value: boolean = false

    public constructor(name: string) {
        super('boolean', name)
    }

    @action
    public toggle() {
        this.value = !this.value
    }
}
