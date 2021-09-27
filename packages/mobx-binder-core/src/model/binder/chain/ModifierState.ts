import { Validity } from '../../../validation/Validity'
import { Data } from './Modifier'

export interface ModifierState<ValidationResult> {
    type: string
    data: Data<unknown>
    validity: Validity<ValidationResult>
    required: boolean
}
