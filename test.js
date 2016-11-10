"use strict";


var sinon = require('sinon');

var chai = require('chai'),
  expect = chai.expect,
  should = chai.should();

chai.use(require('sinon-chai'));


var Logger = require('./logarama.min');


var mocker = null,
  spy = {};


var test = module.exports = {
  beforeEach: function() {
    mocker = sinon.sandbox.create();

    // node doesn't have console.debug
    console.debug = function() {};

    spy = {
      trace: mocker.spy(console, 'trace'),
      debug: mocker.spy(console, 'debug'),
      info: mocker.spy(console, 'info'),
      warn: mocker.spy(console, 'warn'),
      error: mocker.spy(console, 'error'),
    };
  },
  afterEach: function() {
    mocker.restore();
  }
};


test['LEVELS'] = function() {
  Logger.LEVELS.should.eql({
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5,
  });
};


test['basic logger'] = function() {
  var logger = new Logger();

  logger.trace(1);
  spy.trace.should.not.have.been.called;

  logger.debug(2);
  spy.debug.should.have.been.calledOnce;
  spy.debug.should.have.been.calledWithExactly('[DEBUG]: 2');

  logger.info(3);
  spy.info.should.have.been.calledOnce;
  spy.info.should.have.been.calledWithExactly('[INFO]: 3');

  logger.warn(4);
  spy.warn.should.have.been.calledOnce;
  spy.warn.should.have.been.calledWithExactly('[WARN]: 4');

  logger.error(5);
  spy.error.should.have.been.calledOnce;
  spy.error.should.have.been.calledWithExactly('[ERROR]: 5');
};


test['set level'] = function() {
  var logger = new Logger({
    minLevel: 'warn'
  });
  
  logger.minLevel().should.eql('warn');

  logger.trace(1);
  spy.trace.should.not.have.been.called;

  logger.debug(2);
  spy.debug.should.not.have.been.called;

  logger.info(3);
  spy.info.should.not.have.been.called;

  logger.warn(4);
  spy.warn.should.have.been.calledOnce;

  logger.error(5);
  spy.error.should.have.been.calledOnce;
};



test['set level at runtime'] = function() {
  var logger = new Logger({
    minLevel: 'warn'
  });

  logger.minLevel().should.eql('warn');

  logger.trace(1);
  spy.debug.should.not.have.been.called;

  logger.setMinLevel('trace');

  logger.minLevel().should.eql('trace');

  logger.trace(1);
  spy.trace.should.have.been.calledWithExactly('[TRACE]: 1');
};




test['set tag'] = function() {
  var logger = new Logger('app32');

  logger.info(1);
  spy.info.should.have.been.calledWithExactly('app32[INFO]: 1');
};




test['multiple arguments'] = function() {
  var logger = new Logger('app32');

  logger.info(1, 2, 3);
  spy.info.should.have.been.calledThrice;
  spy.info.should.have.been.calledWithExactly('app32[INFO]: 1');
  spy.info.should.have.been.calledWithExactly('app32[INFO]: 2');
  spy.info.should.have.been.calledWithExactly('app32[INFO]: 3');
};




test['default formatting'] = {
  beforeEach: function() {
    this.logger = new Logger();
  },

  'simple': function() {
    this.logger.info(1, 1.2234234, false, true, null, undefined, 'str2');

    spy.info.should.have.been.calledWithExactly('[INFO]: 1');
    spy.info.should.have.been.calledWithExactly('[INFO]: 1.2234234');
    spy.info.should.have.been.calledWithExactly('[INFO]: false');
    spy.info.should.have.been.calledWithExactly('[INFO]: true');
    spy.info.should.have.been.calledWithExactly('[INFO]: null');
    spy.info.should.have.been.calledWithExactly('[INFO]: undefined');
    spy.info.should.have.been.calledWithExactly('[INFO]: str2');
  },


  'Error': function() {
    var error = new Error('test');

    this.logger.error(error);
    spy.error.should.have.been.calledWithExactly('[ERROR]: ' + error.stack);

    error.stack = [123, 456];
    this.logger.error(error);
    spy.error.should.have.been.calledWithExactly("[ERROR]: 123\n456");
  },


  'Array': function() {
    var arr = [1, 2, 3];

    this.logger.info(arr);
    spy.info.should.have.been.calledWithExactly('[INFO]: ' + arr.join("\n"));
  },


  'Object': {
    'JSON stringified': function() {
      var obj = {
        key1: 1.2,
        key2: {
          key2_1: 'abc',
          key2_2: false
        },
        key3: function() {},
        key4: [1,2,3,4],
        key5: [
          {
            key5_1: true            
          }
        ]
      }

      this.logger.info(obj);
      spy.info.should.have.been.calledWithExactly('[INFO]: ' + JSON.stringify(obj, null, 2));
    },

    'Circular references': function() {
      var obj = {
        key1: 1.2,
      }

      obj.key2 = obj;

      this.logger.info(obj);
      spy.info.should.have.been.calledWithExactly('[INFO]: [Object with circular references]');
    }
  }
};




test['custom formatting'] = {
  'return string': function() {
    var logger = new Logger({
      format: function(arg) {
        return '1' + arg;
      }
    });

    logger.info(1, 1.2234234, false, null, undefined, 'str2', {}, [2]);

    spy.info.should.have.been.calledWithExactly('[INFO]: 11');
    spy.info.should.have.been.calledWithExactly('[INFO]: 11.2234234');
    spy.info.should.have.been.calledWithExactly('[INFO]: 1false');
    spy.info.should.have.been.calledWithExactly('[INFO]: 1false');
    spy.info.should.have.been.calledWithExactly('[INFO]: 1null');
    spy.info.should.have.been.calledWithExactly('[INFO]: 1undefined');
    spy.info.should.have.been.calledWithExactly('[INFO]: 1str2');
    spy.info.should.have.been.calledWithExactly('[INFO]: 1[object Object]');
    spy.info.should.have.been.calledWithExactly('[INFO]: 12');    
  },
  
  'return array': function() {
    var logger = new Logger({
      format: function(arg) {
        return ['1' + arg , '2' + arg, '3' + arg];
      }
    });

    logger.info(1, true);

    spy.info.should.have.been.calledWithExactly('[INFO]: 11');
    spy.info.should.have.been.calledWithExactly('[INFO]: 21');
    spy.info.should.have.been.calledWithExactly('[INFO]: 31');
    spy.info.should.have.been.calledWithExactly('[INFO]: 1true');
    spy.info.should.have.been.calledWithExactly('[INFO]: 2true');
    spy.info.should.have.been.calledWithExactly('[INFO]: 3true');
  }
};



test['custom outputter'] = function() {
  var msgs = [];
  
  var logger = new Logger('test', {
    output: function(level, tag, msg) {
      msgs.push([level, tag, msg])
    }
  });

  logger.info(1, 1.2234234, false);

  msgs.should.eql([
    ['info', 'test', '1'],
    ['info', 'test', '1.2234234'],
    ['info', 'test', 'false'],
  ])
};



test['child logger'] = {
  'default': function() {
    var logger = new Logger(),
      childLogger = logger.create();

    childLogger.info(1);
    spy.info.should.have.been.calledWithExactly('[INFO]: 1');
  },

  'parent tag as prefix': function() {
    var logger = new Logger('blah'),
      childLogger = logger.create('mah');

    childLogger.info(1);
    spy.info.should.have.been.calledWithExactly('blah/mah[INFO]: 1');
  },

  'inherits parent level': function() {
    var logger = new Logger('blah', {
      minLevel: 'error',
    }),
      childLogger = logger.create();

    childLogger.warn(1);
    spy.warn.should.not.have.been.called;
  },

  'can override parent level': function() {
    var logger = new Logger('blah', {
      minLevel: 'error',
    }),
      childLogger = logger.create({
        minLevel: 'debug'
      });

    childLogger.warn(1);
    spy.warn.should.have.been.calledOnce;
  },

  'inherits parent formatter': function() {
    var logger = new Logger({
      format: function() {
        return 2;
      }
    }),
      childLogger = logger.create('mah');

    childLogger.warn(1);
    spy.warn.should.have.been.calledWithExactly('mah[WARN]: 2');
  },

  
  'can override parent formatter': function() {
    var logger = new Logger({
      format: function() {
        return 2;
      }
    }),
      childLogger = logger.create('mah', {
        format: function() {
          return 3;
        }
      });

    childLogger.warn(1);
    spy.warn.should.have.been.calledWithExactly('mah[WARN]: 3');
  },

  'inherits parent outputter': function() {
    var msgs = [];
    
    var logger = new Logger({
      output: function() {
        msgs.push(2);
      }
    }),
      childLogger = logger.create('mah');

    childLogger.warn(1);
    msgs.should.eql([2]);
  },

  'can override parent outputter': function() {
    var msgs = [];
    
    var logger = new Logger({
      output: function(level, tag, msg) {
        msgs.push([level, tag, msg]);
      }
    }),
      childLogger = logger.create('mah', {
        output: function(level, msg) {
          msgs.push(3);
        }
      });

    childLogger.warn(1);
    msgs.should.eql([3]);
  },
  
  'tracks parent level changes': function() {
    var logger = new Logger({
      minLevel: 'error'
    });
    
    var childLogger = logger.create({
      minLevel: 'warn'
    });

    childLogger.info(1);
    spy.info.should.not.have.been.called;

    logger.setMinLevel('info');

    childLogger.info(1);
    spy.info.should.have.been.calledWithExactly('[INFO]: 1');
  },

};





