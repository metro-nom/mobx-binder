import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import sinonChai = require('sinon-chai')
import { configure } from 'mobx'

chai.should()

chai.use(chaiAsPromised)
chai.use(sinonChai)

// enable MobX strict mode
configure({
    enforceActions: 'observed',
    disableErrorBoundaries: true,
})
