import { Data, Modifier, ValidValueValidationResult, ValueValidationResult } from './Modifier'
import { Context } from '../Context'
import { isPromise } from '../../../utils/isPromise'
import { FieldStore, Validity } from '../../..'
import { ModifierState } from './ModifierState'

export class AbstractModifier<ValidationResult, ViewType, ModelType> implements Modifier<ValidationResult, ViewType, ModelType> {
    public field: FieldStore<unknown>

    constructor(protected view: Modifier<ValidationResult, any, ViewType>, protected context: Context<ValidationResult>) {
        this.field = view.field
    }

    get name(): string | undefined {
        return undefined
    }

    get type() {
        return 'unknown modification'
    }

    get data() {
        return (this.view.data as any) as Data<ModelType>
    }

    get required() {
        return this.view.required
    }

    get validity() {
        return this.view.validity
    }

    public toView(modelValue: any): ViewType {
        return this.view.toView(modelValue)
    }

    public validateValue(fieldValue: any): ValueValidationResult<ModelType, ValidationResult> {
        const viewResult = this.view.validateValue(fieldValue)
        if (isPromise(viewResult)) {
            return viewResult.then(asyncResult => {
                if (asyncResult.valid) {
                    return this.validateValueLocally(asyncResult)
                }
                return asyncResult
            })
        } else if (viewResult.valid) {
            return this.validateValueLocally(viewResult)
        }
        return viewResult
    }

    protected validateValueLocally(viewResult: ValidValueValidationResult<ViewType>): ValueValidationResult<ModelType, ValidationResult> {
        return (viewResult as unknown) as ValidValueValidationResult<ModelType>
    }

    public validateAsync(blurEvent: boolean): Promise<Validity<ValidationResult>> {
        return this.view.validateAsync(blurEvent)
    }

    public applyConversionsToField(): void {
        const validity = this.validity
        if (validity.status === 'validated' && this.context.valid(validity.result)) {
            this.field.updateValue(this.toView(this.data.value))
        } else {
            this.view.applyConversionsToField()
        }
    }

    public isEqual(first: ModelType, second: ModelType): boolean {
        return this.view.isEqual((first as any) as ViewType, (second as any) as ViewType)
    }

    public get bindingState(): Array<ModifierState<ValidationResult>> {
        const { name, type, data, required, validity } = this
        return [
            ...this.view.bindingState,
            {
                name,
                type,
                data,
                required,
                validity,
            },
        ]
    }
}
