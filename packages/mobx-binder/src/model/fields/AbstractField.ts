import { action, observable } from 'mobx'
import { FieldStore } from './FieldStore'

export default abstract class AbstractField<ValueType> implements FieldStore<ValueType> {

    @observable
    public readOnly: boolean

    @observable
    public required: boolean

    @observable
    public changed: boolean = false

    @observable
    public showValidationResults: boolean = false

    @observable
    public abstract value?: ValueType

    @observable
    public valid?: boolean = undefined

    @observable
    public validating?: boolean = false

    @observable
    public visited: boolean = false

    @observable
    public errorMessage?: string = undefined

    public constructor(
        public readonly valueType: string,
        public readonly name: string) {

        this.readOnly = false
        this.required = false
    }

    @action
    public updateValue(newValue: ValueType) {
        this.value = newValue
    }

    @action
    public handleFocus(): void {
        this.visited = true
    }

    @action
    public handleBlur(): void {
        this.showValidationResults = true
    }

    @action
    public reset(value: ValueType) {
        this.value = value
        this.changed = false
        this.visited = false
        this.showValidationResults = false
        this.valid = undefined
        this.errorMessage = undefined
    }
}
