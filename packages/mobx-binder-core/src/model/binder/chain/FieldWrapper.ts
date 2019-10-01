import { KnownData, Modifier, Validity, ValidValueValidationResult } from './Modifier'
import { Context } from '../Context'
import { FieldStore } from '../../fields/FieldStore'

export class FieldWrapper<ValidationResult, ValueType> implements Modifier<ValidationResult, ValueType, ValueType> {
    constructor(public field: FieldStore<ValueType>, private context: Context<ValidationResult>) {}

    get data(): KnownData<ValueType> {
        return {
            value: this.field.value,
            pending: false,
        }
    }

    get validity(): Validity<ValidationResult> {
        return {
            status: 'validated',
            result: this.context.validResult,
        }
    }

    public toView(modelValue: any) {
        return modelValue
    }

    public validateValue(fieldValue: ValueType): ValidValueValidationResult<ValueType> {
        return {
            valid: true,
            value: fieldValue,
        }
    }

    public validateAsync(): Promise<Validity<ValidationResult>> {
        return Promise.resolve(this.validity)
    }

    public applyConversionsToField(): void {
        // nothing to apply
    }

    public isEqual(first: ValueType, second: ValueType): boolean {
        return first === second
    }
}
