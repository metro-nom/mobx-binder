import { observable } from 'mobx'
import moment from 'moment'

export default class PersonStore {
    @observable public salutation = 'Mr'
    @observable public fullName = 'Max Mustermann'
    @observable public dateOfBirth = moment('2000-01-01')
    @observable public email = 'Max.Mustermann@metro-noreply.com'
    @observable public phoneNumber = '+49 123 456789'
    @observable public toggle: boolean = undefined
}
