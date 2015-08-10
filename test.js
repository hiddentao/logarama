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

  logger.trace(1);
  spy.debug.should.not.have.been.called;

  logger.setLevel('trace');

  logger.trace(1);
  spy.trace.should.have.been.calledWithExactly('[TRACE]: 1');
};




test['set tag'] = function() {
  var logger = new Logger({
    tag: 'app32'
  });

  logger.info(1);
  spy.info.should.have.been.calledWithExactly('app32[INFO]: 1');
};




test['multiple arguments'] = function() {
  var logger = new Logger({
    tag: 'app32'
  });

  logger.info(1, 2, 3);
  spy.info.should.have.been.calledThrice;
  spy.info.should.have.been.calledWithExactly('app32[INFO]: 1');
  spy.info.should.have.been.calledWithExactly('app32[INFO]: 2');
  spy.info.should.have.been.calledWithExactly('app32[INFO]: 3');
};








