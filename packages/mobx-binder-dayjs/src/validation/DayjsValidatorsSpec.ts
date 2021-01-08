import { expect } from 'chai'

import { DayjsValidators } from './DayjsValidators'
// eslint-disable-next-line @typescript-eslint/camelcase
import data_driven = require('data-driven')
import sinon = require('sinon')
import dayjs = require('dayjs')

describe('DayjsValidators', () => {
    const sandbox = sinon.createSandbox()

    const date = (str: string) => dayjs(str, 'DD.MM.YYYY')
    const today = date('12.03.2019')

    beforeEach(() => {
        sandbox.useFakeTimers(new Date(2019, 3, 12).getTime())
        sandbox.stub(DayjsValidators as any, 'today').returns(today)
    })

    afterEach(() => {
        sandbox.restore()
    })

    data_driven(
        [
            // with undefined value
            { method: 'dayInFuture', args: [], value: undefined },
            { method: 'todayOrInFuture', args: [], value: undefined },
            { method: 'dayInPast', args: [], value: undefined },
            { method: 'todayOrInPast', args: [], value: undefined },
            { method: 'age', args: [18], value: undefined },
            // with dayjs
            { method: 'dayInFuture', args: [], value: date('01.01.2099') },
            { method: 'todayOrInFuture', args: [], value: date('01.01.2099') },
            { method: 'todayOrInFuture', args: [], value: today },
            { method: 'dayInPast', args: [], value: date('01.01.2018') },
            { method: 'todayOrInPast', args: [], value: date('01.01.2018') },
            { method: 'todayOrInPast', args: [], value: today },
            { method: 'age', args: [18], value: date('01.01.2001') },
            { method: 'age', args: [undefined, 18], value: date('01.01.2002') },
            { method: 'age', args: [18, 99], value: date('01.01.1920') },
        ],
        () => {
            it('{value} should be correct for {method}({args})', (ctx: any) => {
                const rule = (DayjsValidators as any)[ctx.method](...ctx.args)

                expect(rule(ctx.value)).to.deep.equal({})
            })
        },
    )

    data_driven(
        [
            { method: 'dayInFuture', args: [], value: date('01.01.2018'), messageArgs: {} },
            { method: 'dayInFuture', args: [], value: today },
            { method: 'todayOrInFuture', args: [], value: date('11.02.2019') },
            { method: 'dayInPast', args: [], value: date('13.04.2019') },
            { method: 'dayInPast', args: [], value: today },
            { method: 'todayOrInPast', args: [], value: date('13.04.2019') },
            { method: 'age', args: [18, undefined], value: date('01.01.2002'), messageArgs: { minAge: 18, maxAge: undefined } },
            { method: 'age', args: [undefined, 99], value: date('01.01.1919'), messageArgs: { minAge: undefined, maxAge: 99 } },
            { method: 'age', args: [18, 99], value: date('01.01.2002'), messageArgs: { minAge: 18, maxAge: 99 } },
            { method: 'age', args: [18, 99], value: date('01.01.1919'), messageArgs: { minAge: 18, maxAge: 99 } },
        ],
        () => {
            it('{value} should fail for {method}({args})', (ctx: any) => {
                const rule = (DayjsValidators as any)[ctx.method](...ctx.args)

                expect(rule(ctx.value)).to.deep.equal({
                    messageKey: `validations.${ctx.method}`,
                    args: {
                        value: ctx.value,
                        ...(ctx.messageArgs || {}),
                    },
                })
            })

            it('{value} should fail for {method}({args}) with custom key', (ctx: any) => {
                const rule = (DayjsValidators as any)[ctx.method](...ctx.args, 'custom.key')

                expect(rule(ctx.value)).to.deep.equal({
                    messageKey: `custom.key`,
                    args: {
                        value: ctx.value,
                        ...(ctx.messageArgs || {}),
                    },
                })
            })
        },
    )

    it('should validate "today" correctly', () => {
        sandbox.restore()
        expect(DayjsValidators.todayOrInFuture()(dayjs())).to.deep.equal({})
        expect(DayjsValidators.todayOrInPast()(dayjs())).to.deep.equal({})
    })
})
