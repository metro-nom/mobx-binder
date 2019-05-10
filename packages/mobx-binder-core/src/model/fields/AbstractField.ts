import { action, observable, autorun, runInAction } from 'mobx'
import { FieldStore } from './FieldStore'

export abstract class AbstractField<ValueType> implements FieldStore<ValueType> {

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
    public loading: boolean = false

    @observable
    public validating: boolean = false

    @observable
    public touched: boolean = false

    @observable
    public visited: boolean = false

    @observable
    public errorMessage?: string = undefined

    protected constructor(
        public readonly valueType: string,
        public readonly name: string) {

        this.readOnly = false
        this.required = false
    }

    @action
    public updateValue(newValue: ValueType) {
        this.value = newValue
        this.touched = true
    }

    @action
    public handleFocus(): void {
        this.visited = true
    }

    @action
    public handleBlur(): void {
        autorun(() => {
            runInAction('showValidationResults', () => this.showValidationResults = true)
        }, { name: 'handleBlur', delay: 100 })
    }

    @action
    public reset(value: ValueType) {
        this.value = value
        this.changed = false
        this.touched = false
        this.visited = false
        this.showValidationResults = false
        this.valid = undefined
        this.errorMessage = undefined
    }
}
