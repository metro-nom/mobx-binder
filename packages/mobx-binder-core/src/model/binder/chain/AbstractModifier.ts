import { Data, Modifier, Validity } from './Modifier'
import { Context } from '../Context'

export class AbstractModifier<ValidationResult, ViewType, ModelType> implements Modifier<ValidationResult, ViewType, ModelType> {
    constructor(protected view: Modifier<ValidationResult, any, ViewType>,
                protected context: Context<ValidationResult>,
                public field = view.field) {
    }

    get data() {
        return this.view.data as any as Data<ModelType>
    }

    get validity() {
        return this.view.validity
    }

    public toView(modelValue: any): { value?: ViewType } {
        return this.view.toView(modelValue)
    }

    public validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        return this.view.validateAsync(blurEvent)
    }

    public applyConversionsToField(): void {
        const validity = this.validity
        if (validity.status === 'validated' && this.context.valid(validity.result!)) {
            this.field.updateValue(this.toView(this.data.value))
        } else {
            this.view.applyConversionsToField()
        }
    }

    public isEqual(first: ModelType, second: ModelType): boolean {
        return this.view.isEqual(first as any as ViewType, second as any as ViewType)
    }
}
