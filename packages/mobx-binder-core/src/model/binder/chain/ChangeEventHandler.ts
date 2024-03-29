import { KnownData, Modifier } from './Modifier'
import { reaction } from 'mobx'
import { AbstractModifier } from './AbstractModifier'
import { Context } from '../Context'

export class ChangeEventHandler<ValidationResult, ValueType> extends AbstractModifier<ValidationResult, ValueType, ValueType> {
    constructor(view: Modifier<ValidationResult, any, ValueType>, context: Context<ValidationResult>, private callback: (value: ValueType) => any) {
        super(view, context)
        reaction(
            () =>
                this.field.touched && !view.data.pending && view.validity.status === 'validated' && this.context.valid(view.validity.result)
                    ? view.data
                    : undefined,
            this.handleChange,
        )
    }

    get name() {
        return this.callback.name
    }

    get type() {
        return 'change event handler'
    }

    private handleChange = (data?: KnownData<ValueType>) => {
        if (data) {
            this.callback(data.value)
        }
    }
}
