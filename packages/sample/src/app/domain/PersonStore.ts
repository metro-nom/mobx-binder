import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import dayjs from 'dayjs'

export default class PersonStore {
    public salutation = 'Mr'
    public fullName = 'Max Mustermann'
    public dateOfBirth = moment('2000-01-01')
    public anotherDate = dayjs('2020-01-01')
    public email = 'Max.Mustermann@metro-noreply.com'
    public phoneNumber = '+49 123 456789'
    public toggle: boolean = undefined

    constructor() {
        makeAutoObservable(this)
    }
}
