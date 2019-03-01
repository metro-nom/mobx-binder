import * as mobx from 'mobx'
import { DefaultBinder, DefaultContext, TextField } from 'mobx-binder'

// tslint:disable no-submodule-imports

import PersonStore from '../../domain/PersonStore'
import sleep from 'mobx-binder/lib/test/sleep'
import { MomentConverter } from 'mobx-binder/lib/conversion/MomentConverter'
import { EmailValidator } from 'mobx-binder/lib/validation/EmailValidator'

const { action } = mobx

export default class ProfileStore {
    public salutation = new TextField('salutation')
    public fullName = new TextField('fullName')
    public dateOfBirth = new TextField('dateOfBirth')
    public email = new TextField('email')
    public phoneNumber = new TextField('phoneNumber')

    public binder: DefaultBinder

    constructor(private personStore: PersonStore, context: DefaultContext) {
        this.binder = new DefaultBinder(context)
        this.binder
            .forField(this.salutation).isRequired().bind()
            .forField(this.fullName).isRequired().bind()
            .forField(this.dateOfBirth).withConverter(new MomentConverter('DD.MM.YYYY')).bind()

            .forField(this.email)
            .isRequired()
            .withAsyncValidator(async (value?: string) => {
                await sleep(1000)
                return EmailValidator.validate()(value)
            }, { onBlur: true })
            .onChange(() => {
                console.info('Email changed')
            })
            .bind()

            .forField(this.phoneNumber).bind()
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
