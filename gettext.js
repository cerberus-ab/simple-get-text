/**
 * Simple gettext tool
 *
 * @author Antony Belov <cerberus.ab@mail.ru>
 * @license
 * @module GetText
 * @returns {constructor}
 */
!function(root, factory) {

    // define module as AMD, commonJS or global
    if (typeof define == 'function' && define.amd) {
        define([], function() {
            return factory();
        });
    } else if (typeof exports != 'undefined') {
        exports = module.exports = factory();
    } else {
        root.GetText = factory();
    }

}(this, function() {

    'use strict';

    /**
     * GetText class
     *
     * @constructor
     * @param {object} dictionaries
     */
    function GetText(dictionaries) {
        if (typeof dictionaries != 'object' || dictionaries === null) {
            throw new TypeError('the used dictionaries set is invalid');
        }
        this._dictionaries = dictionaries;
    }

    /**
     * Factory method returns getter instance
     *
     * @method GetText.prototype.useLocale
     * @param {string} locale
     * @param {object} options
     * @returns {Getter}
     */
    GetText.prototype.useLocale = function(locale, options) {
        if (typeof this._dictionaries[locale] == 'undefined') {
            throw new ReferenceError(locale + ' is unknown dictionary');
        }
        return new Getter(this._dictionaries[locale], Object.assign({}, options || {}, {
            locale: locale
        }));
    };

    /**
     * Getter class
     *
     * TODO: think about separator using necessity
     *
     * @constructor
     * @param {object} dictionary, Associative key-value array
     * @param {object} options,
     */
    function Getter(dictionary, options) {
        this._options = Object.assign({
            locale: 'en',
            separator: '.',
            placeholder: '!UNDEFINED TEXT!',
            silent: false

        }, options || {});

        // used dictionary
        if (!Getter._isDictionary(dictionary)) {
            throw new TypeError('the used dictionary is invalid');
        }
        this._dictionary = dictionary;

        // cache of used strings
        this._cache = {};

        // public last error property
        this.lasterr = null;
    }

    // Private static: check dictionary
    Getter._isDictionary = function(dictionary) {
        return typeof dictionary == 'object' && dictionary !== null;
    };

    // Private: on error callback
    Getter.prototype._error = function(message, silent) {
        this.lasterr = this._options.locale + ': ' + message;

        // throw error outside
        if (!this._options.silent && !silent) {
            console.warn(this.lasterr);
        }
    };

    // Private: replace arguments in string
    Getter.prototype._replace = function(string, args) {
        return string.replace(/({\s*(\w+)\s*})/g, function(match, p1, p2) {
            return args[p2];
        });
    };

    /**
     * Get string by property key
     *
     * @method Getter.prototype.get
     * @param {string} key, Property key for needed string
     * @param {object} args, Arguments for preprocessing, Optional
     * @param {boolean} silent, Don't throw errors, Default: false, Optional
     * @returns {string}
     */
    Getter.prototype.get = function(key, args, silent) {
        // key, args/silent
        if (arguments.length == 2) {
            args = typeof arguments[1] == 'object' ? arguments[1] : null;
            silent = typeof arguments[1] != 'object' ? Boolean(arguments[1]) : false;
        }
        var string = this._dictionary[key];

        // clear last error
        this.lasterr = null;

        // check passed key
        if (typeof string == 'undefined' || typeof string == 'object') {
            this._error(key + ' is invalid property key', silent);
            string = this._options.placeholder;
        }
        // preprocess string with args
        else if (typeof args == 'object' && args !== null) {
            string = this._replace(string, args);
        }

        // save to hash and return string
        return this._cache[key] = string;
    };

    /**
     * Use context for get method
     *
     * @method Getter.prototype.use
     * @param {string} context
     * @returns {function} New get function with context
     */
    Getter.prototype.use = function(context) {
        var that = this;

        return function() {
            // change first argument: expected property key
            var args = Array.prototype.slice.call(arguments);
            args[0] = context + (context.length ? that._options.separator : '') + args[0];

            return that.get.apply(that, args);
        }
    };

    /**
     * Merge dictionary
     *
     * @method Getter.prototype.merge
     * @param {object} dictionary
     * @returns {this}
     */
    Getter.prototype.merge = function(dictionary) {
        if (!Getter._isDictionary(dictionary)) {
            throw new TypeError('the used dictionary is invalid');
        }
        this._dictionary = Object.assign(this._dictionary, dictionary);

        return this;
    };

    /**
     * Get used locale
     *
     * @method Getter.prototype.getLocale
     * @returns {string}
     */
    Getter.prototype.getLocale = function() {
        return this._options.locale;
    };

    /**
     * Get current strings cache
     *
     * @method Getter.prototype.getCache
     * @returns {object}
     */
    Getter.prototype.getCache = function() {
        return this._cache;
    };


    return GetText;

});