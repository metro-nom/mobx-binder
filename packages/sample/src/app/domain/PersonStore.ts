import { observable } from 'mobx'
import moment from 'moment'
import dayjs from 'dayjs'

export default class PersonStore {
    @observable public salutation = 'Mr'
    @observable public fullName = 'Max Mustermann'
    @observable public dateOfBirth = moment('2000-01-01')
    @observable public anotherDate = dayjs('2020-01-01')
    @observable public email = 'Max.Mustermann@metro-noreply.com'
    @observable public phoneNumber = '+49 123 456789'
    @observable public toggle: boolean = undefined
}
