import { Binding } from '../binder/Binder'

export interface FieldStore<ValueType> {
    /**
     * The `name` is typically used for the `input` field name.
     */
    readonly name: string

    /**
     * The "type" of the value. For `string`, the Binder has some special handling like Converting empty strings to `undefined` and vice versa.
     */
    readonly valueType: string

    /**
     * Indicates if the values has changed since last `Binder.load()` or `Binder.setUnchanged()`
     * This property is replaced by a getter on bind.
     */
    readonly changed: boolean

    /**
     * If false, validation results should not be shown - like on initial rendering or until first field blur event.
     */
    showValidationResults: boolean

    /**
     * The current value of the form field.
     */
    value: ValueType

    /**
     * The validity status of a form field. Always set, except for unfinished async validations.
     * This property is replaced by a getter on bind.
     */
    readonly valid?: boolean

    /**
     * Set to `true` when a field gets focus for the first time.
     */
    visited: boolean

    /**
     * Set to `true` on first change. Fields are untouched initially, after load() or reset()
     */
    readonly touched: boolean

    /**
     * `true` when an async validation is in progress for the current field.
     * This property is replaced by a getter on bind.
     */
    readonly validating: boolean

    /**
     * If `valid === false`, containing the validation message.
     * This property is bound to .
     */
    errorMessage?: string

    /**
     * Indicates if the field is read only.
     */
    readOnly: boolean

    /**
     * Indicates if the field is a mandatory field.
     * This property is replaced by a getter on bind.
     */
    required: boolean

    /**
     * Optionally return an object with field state rendered into the Binding.state for debugging purposes.
     */
    readonly debugState?: unknown

    /**
     * This function must be used to update field values via the frontend.
     *
     * @param newValue
     */
    updateValue(newValue: ValueType): void

    /**
     * This must be called on blur events for proper validation handling. Implementation has to set `showValidationResults` to `true`.
     */
    handleBlur(): void

    /**
     * This should be called on focus events for proper `visited` status. Implementation has to set `visited` to `true`.
     */
    handleFocus(): void

    /**
     * This is called by the binder framework on load and resets most of the fields to initial status.
     *
     * @param newValue
     */
    reset(newValue: ValueType): void

    /**
     * This is used internally to bind a field
     * @param binding
     */
    bind(binding: Binding<unknown, unknown>): void
}
