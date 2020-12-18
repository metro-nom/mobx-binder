import { FieldStore } from 'mobx-binder'
import React from 'react'
import { FormFieldProps } from './FormField'
import { observer } from 'mobx-react-lite'
import { bool } from '../utils/bool'

export interface FieldInfoProps {
    field: FieldStore<any>
}

export const FieldInfo = observer(({ field }: FormFieldProps) => {
    const { name, valueType, readOnly, required, value, touched, visited, changed, validating, valid, showValidationResults, errorMessage } = field

    return (
        <p>
            <strong>name</strong>: {name}
            <br />
            <strong>valueType</strong>: {valueType}
            <br />
            <strong>readOnly</strong>: {bool(readOnly)}
            <br />
            <strong>required</strong>: {bool(required)}
            <br />
            <strong>value</strong>: {valueType === 'boolean' ? bool(value) : value}
            <br />
            <strong>touched</strong>: {bool(touched)}
            <br />
            <strong>visited</strong>: {bool(visited)}
            <br />
            <strong>changed</strong>: {bool(changed)}
            <br />
            <strong>validating</strong>: {bool(validating)}
            <br />
            <strong>valid</strong>: {bool(valid)}
            <br />
            <strong>showValidationResults</strong>: {bool(showValidationResults)}
            <br />
            <strong>errorMessage</strong>: {errorMessage}
            <br />
        </p>
    )
})
