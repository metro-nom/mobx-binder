import { expect } from 'chai'

import { MomentValidators } from './MomentValidators'
import * as moment from 'moment'
import data_driven = require('data-driven')
import sinon = require('sinon')

describe('Validators', () => {
    const sandbox = sinon.createSandbox()
    let clock: sinon.SinonFakeTimers

    const date = (str: string) => moment(str, 'DD.MM.YYYY')

    beforeEach(() => {
        clock = sandbox.useFakeTimers(new Date(2019, 3, 12).getTime())
    })

    afterEach(() => {
        sandbox.restore()
    })

    data_driven([
        { method: 'dayInFuture', args: [], value: date('01.01.2099') },
        { method: 'todayOrInFuture', args: [], value: date('01.01.2099') },
        { method: 'todayOrInFuture', args: [], value: moment() },
        { method: 'dayInPast', args: [], value: date('01.01.2018') },
        { method: 'todayOrInPast', args: [], value: date('01.01.2018') },
        { method: 'todayOrInPast', args: [], value: moment() },
        { method: 'age', args: [ 18 ], value: date('01.01.2001') },
        { method: 'age', args: [ undefined, 18 ], value: date('01.01.2002') },
        { method: 'age', args: [ 18, 99 ], value: date('01.01.1920') },
    ], () => {
        it('{value} should be correct for {method}({args})', (ctx: any) => {
            const rule = (MomentValidators as any)[ ctx.method ](...ctx.args)

            expect(rule(ctx.value)).to.deep.equal({})
        })
    })

    data_driven([
        { method: 'dayInFuture', args: [], value: date('01.01.2018'), messageArgs: {} },
        { method: 'dayInFuture', args: [], value: moment() },
        { method: 'todayOrInFuture', args: [], value: date('11.04.2019') },
        { method: 'dayInPast', args: [], value: date('13.04.2019') },
        { method: 'dayInPast', args: [], value: moment() },
        { method: 'todayOrInPast', args: [], value: date('13.04.2019') },
        { method: 'age', args: [ 18 ], value: date('01.01.2002'), messageArgs: { minAge: 18, maxAge: undefined } },
        { method: 'age', args: [ undefined, 99 ], value: date('01.01.1919'), messageArgs: { minAge: undefined, maxAge: 99 } },
        { method: 'age', args: [ 18, 99 ], value: date('01.01.2002'), messageArgs: { minAge: 18, maxAge: 99 } },
        { method: 'age', args: [ 18, 99 ], value: date('01.01.1919'), messageArgs: { minAge: 18, maxAge: 99 } },
    ], () => {
        it('{value} should fail for {method}({args})', (ctx: any) => {
            const rule = (MomentValidators as any)[ ctx.method ](...ctx.args)

            expect(rule(ctx.value)).to.deep.equal({
                messageKey: `validations.${ctx.method}`,
                args: {
                    value: ctx.value,
                    ...(ctx.messageArgs || {}),
                },
            })
        })
    })
})
