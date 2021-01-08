import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import sinonChai = require('sinon-chai')
import { configure } from 'mobx'

import customParseFormat from 'dayjs/plugin/customParseFormat'
import dayjs = require('dayjs')

dayjs.extend(customParseFormat)

chai.should()

chai.use(chaiAsPromised)
chai.use(sinonChai)

// enable MobX strict mode
configure({
    enforceActions: 'observed',
    disableErrorBoundaries: true,
})
