import React, { useEffect } from 'react'
import { Button, Col, Form, Row } from 'reactstrap'
import FormField from '../../forms/FormField'
import FieldInfo from '../../forms/FieldInfo'
import { useStores } from '../../../stores'
import { useObserver } from 'mobx-react-lite'

export default function ProfilePage() {
    const {
        i18n: { translate: t },
        personStore,
        profileStore,
    } = useStores()

    useEffect(() => {
        profileStore.onEnter()
    }, [])

    return useObserver(() => {
        const { changed, validating, valid, submitting } = profileStore.binder
        const bool = (it?: boolean) => (it === undefined ? 'undefined' : it ? 'true' : 'false')

        return (
            <div className='profile-page'>
                <h1>Your profile</h1>

                <Form>
                    <Row>
                        <Col>
                            <FormField field={profileStore.fullName} />
                        </Col>
                        <Col>
                            <FieldInfo field={profileStore.fullName} />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormField field={profileStore.dateOfBirth} />
                        </Col>
                        <Col>
                            <FieldInfo field={profileStore.dateOfBirth} />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormField field={profileStore.phoneNumber} />
                        </Col>
                        <Col>
                            <FieldInfo field={profileStore.phoneNumber} />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormField field={profileStore.email} />
                        </Col>
                        <Col>
                            <FieldInfo field={profileStore.email} />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormField field={profileStore.toggle} />
                        </Col>
                        <Col>
                            <FieldInfo field={profileStore.toggle} />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button
                                name='save'
                                kind='primary'
                                active={profileStore.binder.submitting}
                                disabled={!profileStore.binder.changed || profileStore.binder.valid === false}
                                onClick={profileStore.onSubmit}
                            >
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
                    <p>
                        <strong>salutation</strong>: {personStore.salutation}
                        <br />
                        <strong>fullName</strong>: {personStore.fullName}
                        <br />
                        <strong>dateOfBirth</strong>: {personStore.dateOfBirth.format()}
                        <br />
                        <strong>email</strong>: {personStore.email}
                        <br />
                        <strong>phoneNumber</strong>: {personStore.phoneNumber}
                        <br />
                        <strong>toggle</strong>: {bool(personStore.toggle)}
                        <br />
                    </p>
                </Form>
            </div>
        )
    })
}
