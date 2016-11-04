'use strict';

const assert = require('assert');

const GetText = require('../gettext');
const dictionaries = require('./_mocks/dictionaries.json');


describe('Simple gettext tool specification', () => {

    describe('the module', () => {
        it('should be a function', () => {
            assert.equal('function', typeof GetText);
        });
    });

    describe('gettext instance', () => {
        let gt = new GetText(dictionaries);

        it('constructor should throw error in case with invalid passed dictionaries set', () => {
            assert.throws(() => { new GetText(null); }, TypeError);
        });
        it('should have fabric method for init using some locale', () => {
            assert.equal('function', typeof gt.useLocale);
        });
        it(' ..which throws error for unknown locale', () => {
            assert.throws(() => { gt.useLocale('fr'); }, ReferenceError);
        });
        it(' ..which returns getter instance', () => {
            assert.equal('object', typeof gt.useLocale('en'));
        });
    });

    describe('getter instance', () => {
        let inst = new GetText(dictionaries).useLocale('en'),
            optionsKeys = ['locale', 'placeholder', 'silent'];

        it('constructor should throw error in case with invalid used dictionary', () => {
            assert.throws(() => { new GetText(dictionaries).useLocale('sn'); }, TypeError);
        });
        it('should have property with options', () => {
            assert.equal('object', typeof inst._options);
        });
        it(' ..which have attributes: ' + optionsKeys.join(', '), () => {
            assert.equal(String(optionsKeys), String(Object.keys(inst._options)));
        });
        it('should have property with last operation status (by default is null)', () => {
            assert.strictEqual(null, inst.lasterr);
        });
        it('should have method to get current locale', () => {
            assert.equal('en', inst.getLocale());
        });
        it('should have method to get accumulated cache', () => {
            inst.get('common.greet');
            assert.equal(JSON.stringify({ "common.greet": "Hello" }), JSON.stringify(inst.getCache()));
        });
    });

    describe('getter instance: method get', () => {
        let inst = new GetText(dictionaries).useLocale('en');

        it('should be declared', () => {
            assert.equal('function', typeof inst.get);
        });
        it('should return string value by key', () => {
            assert.equal("Hello", inst.get('common.greet'));
        });
        it('should return placeholder for undefined value', () => {
            assert.equal(inst._options.placeholder, inst.get('common.greeting', true));
        });
        it('should return preprocessed string by used arguments', () => {
            assert.equal("Hello, world!", inst.get('common.greet.phrase', { name: 'world' }));
        });
    });

    describe('getter instance: method use', () => {
        let inst = new GetText(dictionaries).useLocale('en');

        it('should be declared', () => {
            assert.equal('function', typeof inst.use);
        });
        it('should return binded get function using context and concatenated by options separator', () => {
            let uses = inst.use('common.');
            assert.equal("Hello", uses('greet'));
            assert.equal("Hello, world!", uses('greet.phrase', { name: 'world' }));
        });
    });

    describe('getter instance: method merge', () => {
        let inst = new GetText(dictionaries).useLocale('en');

        it('should be declared', () => {
            assert.equal('function', typeof inst.merge);
        });
        it('should throw error in case with invalid merged dictionary', () => {
            assert.throws(() => { inst.merge('dictionary'); }, TypeError);
        });
        it('should merge passed dictionary to instance', () => {
            inst.merge({ "merge.property": "A new one string" });
            assert.equal("A new one string", inst.get('merge.property'));
        });
    });

});