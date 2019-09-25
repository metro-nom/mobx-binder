import { FieldStore } from 'mobx-binder'
import React from 'react'
import { observer } from 'mobx-react'

export interface FieldInfoProps {
    field: FieldStore<any>
}

@observer
export default class FieldInfo extends React.Component<FieldInfoProps, any> {
    constructor(props: FieldInfoProps, context: any) {
        super(props, context)
    }

    public render() {
        const {
            name,
            valueType,
            readOnly,
            required,
            value,
            touched,
            visited,
            changed,
            validating,
            valid,
            showValidationResults,
            errorMessage,
        } = this.props.field
        const bool = (it?: boolean) => (it === undefined ? 'undefined' : it ? 'true' : 'false')

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
    }
}
