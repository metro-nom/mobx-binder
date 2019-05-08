import * as React from 'react'
import { inject } from 'mobx-react'
import ProfileStore from './ProfileStore'
import { translatable } from 'react-mobx-i18n'
import { Button, Col, Form, Row } from 'reactstrap'
import FormField from '../../forms/FormField'
import FieldInfo from '../../forms/FieldInfo'
import PersonStore from '../../domain/PersonStore'

export interface ProfilePageContentProps {
    profileStore?: ProfileStore
    personStore?: PersonStore
}

@inject('profileStore', 'personStore')
@translatable
export default class ProfilePage extends React.Component<ProfilePageContentProps, any> {

    public componentWillMount() {
        this.props.profileStore.onEnter()
    }

    public render() {
        const profile = this.props.profileStore!
        const person = this.props.personStore!
        const { changed, validating, valid, submitting } = profile.binder
        const bool = (it?: boolean) => it === undefined ? 'undefined' : (it ? 'true' : 'false')

        return (
            <div className='profile-page'>
                <h1>Your profile</h1>

                <Form>
                    <Row>
                        <Col>
                            <FormField field={ profile.fullName }/>
                        </Col>
                        <Col>
                            <FieldInfo field={ profile.fullName } />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormField field={ profile.dateOfBirth }/>
                        </Col>
                        <Col>
                            <FieldInfo field={ profile.dateOfBirth } />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormField field={ profile.phoneNumber }/>
                        </Col>
                        <Col>
                            <FieldInfo field={ profile.phoneNumber } />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormField field={ profile.email }/>
                        </Col>
                        <Col>
                            <FieldInfo field={ profile.email } />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormField field={ profile.toggle }/>
                        </Col>
                        <Col>
                            <FieldInfo field={ profile.toggle } />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button
                                name='save'
                                kind='primary'
                                active={ profile.binder.submitting }
                                disabled={ !profile.binder.changed || profile.binder.valid === false }
                                onClick={ profile.onSubmit }>
                                { this.t('profilePage.saveButton.label') }
                            </Button>
                        </Col>
                        <Col>
                            <p>
                                <strong>changed</strong>: { bool(changed) }<br/>
                                <strong>validating</strong>: { bool(validating) }<br/>
                                <strong>valid</strong>: { bool(valid) }<br/>
                                <strong>submitting</strong>: { bool(submitting) }<br/>
                            </p>
                        </Col>
                    </Row>
                    <h3>Persisted values</h3>
                    <p>
                        <strong>salutation</strong>: { person.salutation }<br/>
                        <strong>fullName</strong>: { person.fullName }<br/>
                        <strong>dateOfBirth</strong>: { person.dateOfBirth.format() }<br/>
                        <strong>email</strong>: { person.email }<br/>
                        <strong>phoneNumber</strong>: { person.phoneNumber }<br/>
                        <strong>toggle</strong>: { bool(person.toggle) }<br/>
                    </p>
            </Form>
            </div>
        )
    }
}
