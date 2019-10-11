import { FieldStore } from 'mobx-binder'
import React from 'react'
import { FormFieldProps } from 'app/forms/FormField'
import { useObserver } from 'mobx-react-lite'

export interface FieldInfoProps {
    field: FieldStore<any>
}

export default function FieldInfo({ field }: FormFieldProps) {
    const bool = (it?: boolean) => (it === undefined ? 'undefined' : it ? 'true' : 'false')

    return useObserver(() => {
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
}
