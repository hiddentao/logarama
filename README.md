# logarama

[![Build Status](https://secure.travis-ci.org/hiddentao/logarama.png)](http://travis-ci.org/hiddentao/logarama)

Yet another simple logging library for the browser with minimum levels and hierarchical loggers.

* All log methods map to same-named `console` methods.
* An instantiable `Logger` class - allowing for multiple separate logger instances which can be individually controlled.
* Create child loggers which inherit parent loggers' options and yet can be customized.
* Change logging level (and children's logging levels) at runtime.
* Built-in smart log message formatting, with customizability.
* Supports [UMD](https://github.com/umdjs/umd) for easy integration within your project.
* Small (<1KB).

## Installation

```bash
$ npm install logarama
```

## How to use

```js
var Logger = require('logarama');

var logger = new Logger();

logger.debug('this', 'is', 'an', 'array', [1,2,3]);

/*
[DEBUG]: this
[DEBUG]: is
[DEBUG]: an
[DEBUG]: array
[DEBUG]: 1
2
3
*/
```

By default the minimum logging level is `debug`. You can override this:


```js
var Logger = require('logarama');

var logger = new Logger({
  minLevel: 'error'
});

logger.trace(1);
logger.debug(2);
logger.info(3);
logger.warn(4);
logger.error(5);

/*
app[ERROR]: 5
*/
```

Change logging level at runtime:


```js
var Logger = require('logarama');

var logger = new Logger({
  minLevel: 'error'
});

logger.debug(2);
logger.setMinLevel('debug');
logger.debug(3);

/*
app[DEBUG]: 3
*/
```

**Tags**

Add a tag (prefix) to your messages:


```js
var Logger = require('logarama');

var logger = new Logger({
  tag: 'app'
});

logger.trace(1);
logger.debug(2);
logger.info(3);
logger.warn(4);
logger.error(5);

/*
app[TRACE]: 1
   (anonymous function) ...
app[DEBUG]: 2
app[INFO]: 3
app[WARN]: 4
app[ERROR]: 5
*/
```

**Formatting**

You can override the built-in argument formatter with your own:


```js
var Logger = require('logarama');

var logger = new Logger({
  format: function(arg) {
    return '{' + arg + '}';
  }
});

logger.debug(2, null, undefined, false, 'str', 23.2, [1,2,3]);

/*
app[DEBUG]: {2}
app[DEBUG]: {null}
app[DEBUG]: {undefined}
app[DEBUG]: {false}
app[DEBUG]: {str}
app[DEBUG]: {23.2}
app[DEBUG]: {1,2,3}
*/
```

**Child loggers**

Child loggers inherit their parent's properties.

```js
var Logger = require('logarama');

var logger = new Logger({
  tag: 'parent',
  minLevel: 'info',
});

var child = logger.create();
child.debug(2);
child.info(2);

/*
parent[INFO]: 2
*/
```

However, child tags are prefixed by their parents' tags:

```js
var Logger = require('logarama');

var logger = new Logger({
  tag: 'parent',
  minLevel: 'info',
});

var child = logger.create({
  tag: 'child'
});

child.info(2);

/*
parent/child[INFO]: 2
*/
```

Parent level changes get propagated down to children:

```js
var Logger = require('logarama');

var logger = new Logger({
  tag: 'parent',
  minLevel: 'warn',
});

var child = logger.create({
  tag: 'child',
  minLevel: 'error',
});

child.info(2);
logger.setMinLevel('info');
child.info(3);

/*
parent/child[INFO]: 3
*/
```


## Browser noConflict

If you're not using a module loader in browser environments then 
`window.Logger` gets set. You can use `noConflict()` to 
restore the original value of this property:

```js
window.Logger = 2;

// load logarama.js
// window.Logger now equals the Logger class

// restore the original
var Logger = window.Logger.noConflict();

// window.Logger now equals 2
```


## Building

To build the code and run the tests:

    $ npm install
    $ npm run build


## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/hiddentao/logarama/blob/master/CONTRIBUTING.md).


## License

MIT - see [LICENSE.md](https://github.com/hiddentao/logarama/blob/master/LICENSE.md)