import React, { useEffect } from 'react'
import { FieldStore } from 'mobx-binder'
import { Button, Col, Form, Row } from 'reactstrap'
import { FormField } from '../../forms/FormField'
import { FieldInfo } from '../../forms/FieldInfo'
import { useStores } from '../../../stores'
import { observer } from 'mobx-react-lite'
import { bool } from '../../utils/bool'

const FieldRow = ({ field }: { field: FieldStore<any> }) => (
    <Row>
        <Col>
            <FormField field={field} />
        </Col>
        <Col>
            <FieldInfo field={field} />
        </Col>
    </Row>
)

const StoredPersonProperties = observer(() => {
    const { personStore } = useStores()

    return (
        <p>
            <strong>salutation</strong>: {personStore.salutation}
            <br />
            <strong>fullName</strong>: {personStore.fullName}
            <br />
            <strong>dateOfBirth</strong>: {personStore.dateOfBirth.format()}
            <br />
            <strong>anotherDate</strong>: {personStore.anotherDate.format()}
            <br />
            <strong>email</strong>: {personStore.email}
            <br />
            <strong>phoneNumber</strong>: {personStore.phoneNumber}
            <br />
            <strong>toggle</strong>: {bool(personStore.toggle)}
            <br />
        </p>
    )
})

export const ProfilePage = observer(() => {
    const {
        i18n: { translate: t },
        profileStore: { binder, dateOfBirth, anotherDate, email, fullName, onEnter, onSubmit, phoneNumber, toggle },
    } = useStores()
    const { changed, validating, valid, submitting } = binder

    useEffect(() => {
        onEnter()
    }, [])

    return (
        <div className='profile-page'>
            <h1>Your profile</h1>

            <Form>
                <FieldRow field={fullName} />
                <FieldRow field={dateOfBirth} />
                <FieldRow field={anotherDate} />
                <FieldRow field={phoneNumber} />
                <FieldRow field={email} />
                <FieldRow field={toggle} />
                <Row>
                    <Col>
                        <Button name='save' kind='primary' active={submitting} disabled={!changed || valid === false} onClick={onSubmit}>
                            {t('profilePage.saveButton.label')}
                        </Button>
                    </Col>
                    <Col>
                        <p>
                            <strong>changed</strong>: {bool(changed)}
                            <br />
                            <strong>validating</strong>: {bool(validating)}
                            <br />
                            <strong>valid</strong>: {bool(valid)}
                            <br />
                            <strong>submitting</strong>: {bool(submitting)}
                            <br />
                        </p>
                    </Col>
                </Row>
                <h3>Persisted values</h3>
                <StoredPersonProperties />
            </Form>
        </div>
    )
})
