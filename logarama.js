(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    let previous = root.Logger,
      exported = factory();

    exported.noConflict = function() {
      root[key] = previous;
      return exported;
    };

    root.Logger = exported;
  }
}(this, function () {
  "use strict";

  class Logger {

    constructor (tag = null, options = {}) {
      this._children = [];

      if (1 === arguments.length && 'string' !== typeof tag) {
        options = tag || {};
        tag = null;
      }

      this._tag = tag || '';
      this._minLevel = options.minLevel || 'debug';
      this._format = options.format || this._defaultFormat;
      this._output = options.output || this._defaultOutput;

      this._initMethods();
    }


    create (tag = null, options = {}) {
      if (1 === arguments.length && 'string' !== typeof tag) {
        options = tag || {};
        tag = null;
      }

      tag = (this._tag.length ? this._tag + '/' : '') + (tag || '');
      options.minLevel = options.minLevel || this._minLevel;
      options.format = options.format || this._format;
      options.output = options.output || this._output;

      const child = new Logger(tag, options);

      this._children.push(child);

      return child;
    }

    minLevel() {
      return this._minLevel;
    }

    setMinLevel (minLevel) {
      this._minLevel = minLevel;
      this._initMethods();

      this._children.forEach( (c) => {
        c.setMinLevel(minLevel);
      });
    }

    throw (err) {
      const prefix = this._tag ? `(${this._tag}) `: '';

      throw new Error(`${prefix}${err}`)
    }


    __defaultFormatHelper (arg) {
      let str = ''

      // Error
      if (arg instanceof Error) {
        if (arg.stack) {
          str = this.__defaultFormatHelper(arg.stack)
        } else {
          str = '' + arg
        }
      }
      // Array
      else if (arg instanceof Array) {
        if (!arg.length) {
          str = '[]'
        } else {
          str = '[ ' + arg.map((a) => {
            const r = this.__defaultFormatHelper(a)

            return (typeof a === 'string' ? `"${r}"` : r)
          }).join(', ') + ' ]'
        }
      }
      // Object (but not null)
      else if (arg && typeof arg === 'object') {
        if (!Object.keys(arg).length) {
          str = '{}'
        } else {
          const items = []

          for (let k in arg) {
            if (typeof arg[k] !== 'function') {
              const r = this.__defaultFormatHelper(arg[k])

              items.push(`${k}: ` + (typeof arg[k] === 'string' ? `"${r}"` : r))
            }
          }

          str = '{ ' + items.join(', ') + ' }'
        }
      }
      // Function
      else if (typeof arg === 'function') {
        str = '<fn>'
      }
      // everything else - primitive values
      else {
        str = '' + arg
      }

      return str;
    }


    _defaultFormat (arg) {
      try {
        return this.__defaultFormatHelper(arg)
      } catch (err) {
        if ('RangeError' === err.name) {
          return '[Object with circular references]';
        } else {
          throw err;
        }
      }
    }


    _defaultOutput (level, tag, args) {
      args.forEach((a) => {
        console[level](`${tag}[${level.toUpperCase()}]: ${a}`)
      })
    }

    _constructLogMethod (level) {
      const self = this

      if (LEVELS[level] >= LEVELS[self._minLevel]) {
        this[level] = function() {
          self._output(level, self._tag,
            Array.prototype.slice.call(arguments).map(self._format.bind(self))
          )
        }
      } else {
        self[level] = self._noop;
      }
    }

    _initMethods () {
      Object.keys(LEVELS).forEach((level) => {
        this._constructLogMethod(level);
      });
    }

    _noop () {}
  }


  const LEVELS = Logger.LEVELS = {
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5,
  };


  return Logger;

}));
