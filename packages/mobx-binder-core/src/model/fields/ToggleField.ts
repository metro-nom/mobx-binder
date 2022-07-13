import { action, makeObservable, observable } from 'mobx'
import { AbstractField } from './AbstractField'

/*
    `name`: the immutable field name
    `value`: the frontend textfield value
    `data`: the backend boolean value
 */
export class ToggleField extends AbstractField<boolean> {
    public value = false

    public constructor(name: string) {
        super('boolean', name)

        makeObservable(this, {
            value: observable,
            toggle: action.bound,
        })
    }

    public toggle() {
        this.value = !this.value
    }
}
