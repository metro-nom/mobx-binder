import { expect } from 'chai'

import { MomentValidators } from './MomentValidators'
import * as moment from 'moment'
import data_driven = require('data-driven')

describe('Validators', () => {

    data_driven([
        { method: 'dayInFuture', args: [], value: moment('01.01.2099', 'DD.MM.YYYY') },
        { method: 'todayOrInFuture', args: [], value: moment('01.01.2099', 'DD.MM.YYYY') },
        { method: 'todayOrInFuture', args: [], value: moment() },
        { method: 'dayInPast', args: [], value: moment('01.01.2018', 'DD.MM.YYYY') },
        { method: 'todayOrInPast', args: [], value: moment('01.01.2018', 'DD.MM.YYYY') },
        { method: 'todayOrInPast', args: [], value: moment() },
    ], () => {
        it('{value} should be correct for {method}({args})', (ctx: any) => {
            const rule = (MomentValidators as any)[ ctx.method ](...ctx.args)

            expect(rule(context, ctx.value)).to.deep.equal({})
        })
    })

    // TODO write negative tests
})
