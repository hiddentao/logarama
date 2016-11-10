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


    _defaultFormat (arg) {
      let lines = '';

      // Error
      if (arg instanceof Error) {
        lines = (arg.stack instanceof Array ? arg.stack.join("\n") : this._format(arg.stack));
      } 
      // Array
      else if (arg instanceof Array) {
        lines = arg.join("\n");          
      }
      // Object
      else if (arg instanceof Object) {
        try {
          lines = JSON.stringify(arg, null, 2);
        } catch (err) {
          // json error
          lines = '[Object with circular references]';
        }
      }
      // everything else
      else {
        lines = arg + '';
      }

      return lines;
    }
    
    
    _defaultOutput (level, tag, msg) {
      console[level](`${tag}[${level.toUpperCase()}]: ${msg}`);
    }


    _writeToLog (level, msg) {
      [].concat(msg).forEach((str) => {
        this._output(level, this._tag, str)
      });
    }


    _constructLogMethod (level) {
      const self = this
      
      if (LEVELS[level] >= LEVELS[self._minLevel]) {
        this[level] = function() {
          Array.prototype.slice.call(arguments).forEach(function(arg) {
            self._writeToLog(level, self._format(arg));
          });
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
