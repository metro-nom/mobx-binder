import {action, makeObservable, runInAction} from 'mobx'
import {DefaultBinder, EmailValidator, TextField, ToggleField, TrimConverter} from 'mobx-binder'
import {MomentConverter} from 'mobx-binder-moment'

// tslint:disable no-submodule-imports
import PersonStore from '../../domain/PersonStore'
import {TranslateFunction} from 'react-mobx-i18n'
import {AsyncPhoneNumberConverter} from 'app/domain/AsyncPhoneNumberConverter'
import sleep from 'app/domain/sleep'
import {DayjsConverter} from 'mobx-binder-dayjs'

const trimConverter = new TrimConverter()

export default class ProfileStore {
    public salutation = new TextField('salutation')
    public fullName = new TextField('fullName')
    public dateOfBirth = new TextField('dateOfBirth')
    public anotherDate = new TextField('anotherDate')
    public email = new TextField('email')
    public phoneNumber = new TextField('phoneNumber')
    public toggle = new ToggleField('toggle')

    public binder: DefaultBinder

    constructor(private personStore: PersonStore, private t: TranslateFunction) {
        makeObservable(this, {
            onEnter: action,
            onSubmit: action,
        })

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

            .forStringField(this.anotherDate)
            .withConverter(trimConverter)
            .withConverter(new DayjsConverter('DD.MM.YYYY', undefined, true))
            .bind()

            .forStringField(this.email)
            .isRequired()
            .withConverter(trimConverter)
            .withAsyncValidator(
                async (value?: string) => {
                    await sleep(1000)
                    return EmailValidator.validate()(value ?? '')
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

    public onEnter = () => {
        this.binder.load(this.personStore)
    }

    public onSubmit = () => {
        if (!this.binder.submitting) {
            return this.binder
                .submit(this.personStore, async data => {
                    await sleep(1000)
                    runInAction(() => {
                        // needed because of strict mobx configuration
                        if (data.fullName === 'show-submission-error') {
                            throw new Error('wrong-fullName')
                        }
                    })
                    this.binder.setUnchanged()
                    return data
                })
                .then(values => {
                    console.info('Submission successful', values)
                })
                .catch(
                    action((err: Error) => {
                        console.info(`Submit validation failed: ${err.message}`)
                        if (err.message === 'wrong-fullName') {
                            this.fullName.errorMessage = this.t('validations.fullName.submissionError')
                        }
                    }),
                )
        }
    }
}
