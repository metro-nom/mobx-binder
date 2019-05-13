import { Data, Modifier, Validity } from './Modifier'
import { reaction } from 'mobx'

export class ChangeEventHandler<ValidationResult, ValueType> implements Modifier<ValidationResult, ValueType, ValueType> {
    constructor(private view: Modifier<ValidationResult, any, ValueType>,
                private callback: (value: ValueType) => any,
                public field = view.field) {
        reaction(
            () => field.touched && !view.data.pending ? view.data : undefined,
            this.handleChange)
    }

    get data() {
        return this.view.data
    }

    get validity() {
        return this.view.validity
    }

    public toView(modelValue: any): { value?: ValueType } {
        return this.view.toView(modelValue)
    }

    public validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        return this.view.validateAsync(blurEvent)
    }

    private handleChange = (data?: Data<ValueType>) => {
        if (data) {
            this.callback(data.value!)
        }
    }
}
