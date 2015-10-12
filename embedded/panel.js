'use strict';

var events = require('events'),
    debug = require('debug')('panel'),
    process = require('process'),
    util = require('util');

// This only works on the raspberry pi.
try {
  var onoff = require('onoff');
} catch (e) {}

var debounceThresholdMillis = 200;

var Panel = function() {
  this.lastCmd = new Date();

  // Listen for signals (on non-raspberry pi platorms).
  process.on('SIGUSR1', this.activate.bind(this));
  process.on('SIGUSR2', this.reset.bind(this));

  // Listen for gpio edges on raspberry pi.
  if (onoff) {
    // Pin 6
    var activate = new onoff.Gpio(17, 'in', 'rising');
    activate.watch(this.activate.bind(this));

    // Pin 8
    var reset = new onoff.Gpio(22, 'in', 'rising');
    reset.watch(this.reset.bind(this));
  }

  this.cleanup = function() {
    if (activate) {
      activate.unexport();
    }

    if (reset) {
      reset.unexport();
    }
  };
};
util.inherits(Panel, events.EventEmitter);

Panel.prototype.reset = function() {
  if (new Date() - this.lastCmd < debounceThresholdMillis) {
    debug('Debounced reset signal.');
    return;
  }
  debug('Received reset signal.');
  this.lastCmd = new Date();
  this.emit('reset');
};

Panel.prototype.activate = function() {
  if (new Date() - this.lastCmd < debounceThresholdMillis) {
    debug('Debounced activate signal.');
    return;
  }
  debug('Received activate signal.');
  this.lastCmd = new Date();
  this.emit('activate');
};


module.exports = Panel;
