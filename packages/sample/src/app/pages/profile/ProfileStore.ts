import * as mobx from 'mobx'
import { DefaultBinder, TextField, EmailValidator } from 'mobx-binder'
import { MomentConverter } from 'mobx-binder-moment'

// tslint:disable no-submodule-imports

import PersonStore from '../../domain/PersonStore'
import sleep from 'mobx-binder/lib/test/sleep'
import { TranslateFunction } from 'react-mobx-i18n'
import { ToggleField, TrimConverter } from '../../../../../mobx-binder-core/src'

const { action } = mobx

export default class ProfileStore {
    public salutation = new TextField('salutation')
    public fullName = new TextField('fullName')
    public dateOfBirth = new TextField('dateOfBirth')
    public email = new TextField('email')
    public phoneNumber = new TextField('phoneNumber')
    public toggle = new ToggleField('toggle')

    public binder: DefaultBinder

    constructor(private personStore: PersonStore, t: TranslateFunction) {
        this.binder = new DefaultBinder({ t })
        this.binder
            .forField(this.salutation).isRequired().withConverter(new TrimConverter()).bind()
            .forField(this.fullName).isRequired().withConverter(new TrimConverter()).bind()
            .forField(this.dateOfBirth).withConverter(new TrimConverter()).withConverter(new MomentConverter('DD.MM.YYYY')).bind()

            .forField(this.email)
            .isRequired()
            .withConverter(new TrimConverter())
            .withAsyncValidator(async (value?: string) => {
                await sleep(1000)
                return EmailValidator.validate()(value)
            }, { onBlur: true })
            .onChange(() => {
                console.info('Email changed')
            })
            .bind()

            .forField(this.phoneNumber).withConverter(new TrimConverter()).bind()
            .forField(this.toggle).bind()
    }

    @action
    public onEnter = () => {
        this.binder.load(this.personStore)
    }

    public onSubmit = () => {
        if (!this.binder.submitting) {
            return this.binder.submit(this.personStore,
                () => {
                    this.binder.setUnchanged()
                    return sleep(1000)
                })
                .then(values => {
                    console.info('Submission successful', values)
                })
                .catch((err: Error) => {
                    console.info(`Submit validation failed: ${err.message}`)
                })
        }
    }
}
