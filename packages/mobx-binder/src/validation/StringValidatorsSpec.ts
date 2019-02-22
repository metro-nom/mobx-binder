import { expect } from 'chai'
import data_driven = require('data-driven')

import { StringValidators } from './StringValidators'

describe('Validators', () => {

    data_driven([
        { method: 'matchLength', args: [ 5 ], value: '12345' },
        { method: 'minLength', args: [ 5 ], value: '12345' },
        { method: 'minLength', args: [ 5 ], value: '123456' },
        { method: 'maxLength', args: [ 5 ], value: '1234' },
        { method: 'maxLength', args: [ 5 ], value: '12345' },
        { method: 'lengths', args: [ 5, 5 ], value: '12345' },
        { method: 'equals', args: [ 'foo' ], value: 'foo' },
        { method: 'equals', args: [ true ], value: true },
        { method: 'regexp', args: [ /^[0-9]*$/ ], value: '123' },
        { method: 'regexp', args: [ /[0-9]+/ ], value: '123abc' },
        { method: 'noWhitespaces', args: [], value: 'SomeThingWithoutWhitespaces' },
        { method: 'required', args: [], value: '1' },
        { method: 'required', args: [], value: false },
    ], () => {
        it('{value} should be correct for {method}({args})', (ctx: any) => {
            const rule = (StringValidators as any)[ ctx.method ](...ctx.args)

            expect(rule(ctx.value)).to.deep.equal({})
        })
    })

    data_driven([
        {
            method: 'matchLength', args: [ 5 ], value: '1234',
            messageKey: 'validations.matchLength',
            messageArgs: { value: '1234', match: 5 }
        },
        {
            method: 'matchLength', args: [ 5 ], value: '123456',
            messageKey: 'validations.matchLength',
            messageArgs: { value: '123456', match: 5 }
        },
        {
            method: 'minLength', args: [ 5 ], value: '1234',
            messageKey: 'validations.minLength',
            messageArgs: { value: '1234', min: 5 }
        },
        {
            method: 'maxLength', args: [ 5 ], value: '123456',
            messageKey: 'validations.maxLength',
            messageArgs: { value: '123456', max: 5 }
        },
        {
            method: 'lengths', args: [ 5, 5 ], value: '1234',
            messageKey: 'validations.lengths',
            messageArgs: { value: '1234', min: 5, max: 5 }
        },
        {
            method: 'equals', args: [ 'foo' ], value: 'bar',
            messageKey: 'validations.equals',
            messageArgs: { value: 'bar' }
        },
        {
            method: 'equals', args: [ 'false' ], value: false,
            messageKey: 'validations.equals',
            messageArgs: { value: false }
        },
        {
            method: 'equals', args: [ true ], value: false,
            messageKey: 'validations.equals',
            messageArgs: { value: false }
        },
        {
            method: 'regexp', args: [ /^[0-9]+$/ ], value: 'abc',
            messageKey: 'validations.regexp',
            messageArgs: { value: 'abc', regexp: '/^[0-9]+$/' }
        },
        {
            method: 'noWhitespaces', args: [], value: 'Contains Whitespaces ',
            messageKey: 'validations.noWhitespaces',
            messageArgs: { value: 'Contains Whitespaces ' }
        },
        {
            method: 'required', args: [], value: '',
            messageKey: 'validations.required',
            messageArgs: undefined
        },
        {
            method: 'required', args: [], value: undefined,
            messageKey: 'validations.required',
            messageArgs: undefined
        },
        {
            method: 'required', args: [], value: null,
            messageKey: 'validations.required',
            messageArgs: undefined
        }
    ], () => {
        it('{value} should be incorrect for {method}({args}) returning {messageKey}', (ctx: any) => {
            const rule = (StringValidators as any)[ ctx.method ](...ctx.args)

            expect(rule(ctx.value)).to.deep.equal({
                messageKey: ctx.messageKey,
                args: ctx.messageArgs
            })
        })
    })
})
