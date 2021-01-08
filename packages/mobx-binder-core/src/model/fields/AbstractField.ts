import { action, autorun, makeObservable, observable, runInAction } from 'mobx'
import { FieldStore } from './FieldStore'

export abstract class AbstractField<ValueType> implements FieldStore<ValueType> {
    public readOnly = false

    public required = false

    public changed = false

    public showValidationResults = false

    public abstract value: ValueType

    public valid?: boolean = undefined

    public validating = false

    public touched = false

    public visited = false

    public errorMessage?: string = undefined

    protected constructor(public readonly valueType: string, public readonly name: string) {
        makeObservable(this, {
            readOnly: observable,
            required: observable,
            changed: observable,
            showValidationResults: observable,
            valid: observable,
            validating: observable,
            touched: observable,
            visited: observable,
            errorMessage: observable,

            updateValue: action,
            handleFocus: action,
            handleBlur: action,
            reset: action,
        })
    }

    public updateValue(newValue: ValueType) {
        this.value = newValue
        this.touched = true
    }

    public handleFocus(): void {
        this.visited = true
    }

    public handleBlur(): void {
        autorun(
            () =>
                runInAction(() => {
                    this.showValidationResults = true
                }),
            { name: 'handleBlur', delay: 100 },
        )
    }

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
