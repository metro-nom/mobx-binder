import { FormFeedback, FormGroup, Input, Label } from 'reactstrap'
import { FieldStore } from 'mobx-binder'
import React from 'react'
import { translatable } from 'react-mobx-i18n'

export interface FormFieldProps {
    field: FieldStore<any>
}

@translatable
export default class FormField extends React.Component<FormFieldProps, any> {
    constructor(props: FormFieldProps, context: any) {
        super(props, context)
    }

    public render() {
        const { field } = this.props as any
        const showValidationResults = !field.validating && field.showValidationResults
        const valid = showValidationResults && field.valid === true
        const invalid = showValidationResults && field.valid === false
        const errorMessage = showValidationResults ? field.errorMessage || null : null

        return (
            <FormGroup>
                {field.valueType === 'string' ? (
                    <>
                        <Label for={field.name}>{this.t(`form.fields.${field.name}`)}</Label>
                        <Input
                            id={field.name}
                            type='text'
                            name={field.name}
                            value={field.value}
                            readOnly={field.readOnly}
                            valid={valid}
                            invalid={invalid}
                            onChange={this.updateTextFieldValue}
                            onFocus={this.handleFocus}
                            onBlur={this.handleBlur}
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
                            onChange={this.updateCheckboxFieldValue}
                            onFocus={this.handleFocus}
                            onBlur={this.handleBlur}
                        />
                        {this.t(`form.fields.${field.name}`)}
                    </Label>
                )}
                <FormFeedback>{errorMessage}</FormFeedback>
            </FormGroup>
        )
    }

    private handleBlur = () => {
        this.props.field.handleBlur()
    }

    private handleFocus = () => {
        this.props.field.handleFocus()
    }

    private updateTextFieldValue = (event: any) => {
        this.props.field.updateValue(event.target.value)
    }
    private updateCheckboxFieldValue = (event: any) => {
        this.props.field.updateValue(event.target.checked)
    }
}
