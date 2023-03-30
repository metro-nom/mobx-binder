import { FormFeedback, FormGroup, Input, Label } from 'reactstrap'
import { FieldStore } from 'mobx-binder'
import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../stores'

export interface FormFieldProps {
    field: FieldStore<any>
}

export const FormField = observer(({ field }: FormFieldProps) => {
    const {
        i18n: { t },
    } = useStores()

    const showValidationResults = !field.validating && field.showValidationResults
    const valid = showValidationResults && field.valid === true
    const invalid = showValidationResults && field.valid === false
    const errorMessage = showValidationResults && field.errorMessage ? field.errorMessage : null

    const handleBlur = () => {
        field.handleBlur()
    }

    const handleFocus = () => {
        field.handleFocus()
    }

    const updateTextFieldValue = (event: any) => {
        field.updateValue(event.target.value)
    }
    const updateCheckboxFieldValue = (event: any) => {
        field.updateValue(event.target.checked)
    }

    return (
        <FormGroup>
            {field.valueType === 'string' ? (
                <>
                    <Label for={field.name}>{t(`form.fields.${field.name}`)}</Label>
                    <Input
                        id={field.name}
                        type='text'
                        name={field.name}
                        value={field.value}
                        readOnly={field.readOnly}
                        valid={valid}
                        invalid={invalid}
                        onChange={updateTextFieldValue}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                </>
            ) : (
                <Label for={field.name}>
                    <Input
                        id={field.name}
                        type='checkbox'
                        name={field.name}
                        checked={!!field.value}
                        readOnly={field.readOnly}
                        valid={valid}
                        invalid={invalid}
                        onChange={updateCheckboxFieldValue}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                    {t(`form.fields.${field.name}`)}
                </Label>
            )}
            <FormFeedback>{errorMessage}</FormFeedback>
        </FormGroup>
    )
})
