import { action, runInAction } from 'mobx'
import { DefaultBinder, TextField, EmailValidator, ToggleField, TrimConverter } from 'mobx-binder'
import { MomentConverter } from 'mobx-binder-moment'

// tslint:disable no-submodule-imports

import PersonStore from '../../domain/PersonStore'
import sleep from 'mobx-binder/lib/test/sleep'
import { TranslateFunction } from 'react-mobx-i18n'
import { AsyncPhoneNumberConverter } from 'app/domain/AsyncPhoneNumberConverter'

const trimConverter = new TrimConverter()

export default class ProfileStore {
    public salutation = new TextField('salutation')
    public fullName = new TextField('fullName')
    public dateOfBirth = new TextField('dateOfBirth')
    public email = new TextField('email')
    public phoneNumber = new TextField('phoneNumber')
    public toggle = new ToggleField('toggle')

    public binder: DefaultBinder

    constructor(private personStore: PersonStore, private t: TranslateFunction) {
        this.binder = new DefaultBinder({ t })
        this.binder
            .forStringField(this.salutation)
            .isRequired()
            .withConverter(trimConverter)
            .bind()
            .forStringField(this.fullName)
            .isRequired()
            .withConverter(trimConverter)
            .bind()
            .forStringField(this.dateOfBirth)
            .withConverter(trimConverter)
            .withConverter(new MomentConverter('DD.MM.YYYY'))
            .bind()

            .forStringField(this.email)
            .isRequired()
            .withAsyncValidator(
                async (value?: string) => {
                    await sleep(1000)
                    return EmailValidator.validate()(value)
                },
                { onBlur: true },
            )
            .withConverter(trimConverter)
            .onChange(() => {
                console.info('Email changed')
            })
            .bind()

            .forStringField(this.phoneNumber)
            .withConverter(trimConverter)
            .withAsyncConverter(new AsyncPhoneNumberConverter(), { onBlur: true })
            .bind()
            .forField(this.toggle)
            .bind()
    }

    @action
    public onEnter = () => {
        this.binder.load(this.personStore)
    }

    public onSubmit = () => {
        if (!this.binder.submitting) {
            return this.binder
                .submit(this.personStore, async data => {
                    await sleep(1000)
                    if (data.fullName === 'show-submission-error') {
                        throw new Error('wrong-fullName')
                    }
                    this.binder.setUnchanged()
                    return data
                })
                .then(values => {
                    console.info('Submission successful', values)
                })
                .catch((err: Error) => {
                    console.info(`Submit validation failed: ${err.message}`)
                    if (err.message === 'wrong-fullName') {
                        runInAction(() => {
                            this.fullName.errorMessage = this.t('validations.fullName.submissionError')
                        })
                    }
                })
        }
    }
}
