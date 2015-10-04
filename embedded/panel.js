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

  this.cleanup = function() {
    activate && activate.unexport();
    reset && reset.unexport();
  }

  this.reset = function() {
    if (new Date() - this.lastCmd < debounceThresholdMillis) {
      debug('Debounced reset signal.');
      return;
    }
    debug('Received reset signal.');
    this.lastCmd = new Date();
    this.emit('reset');
  }

  this.activate = function() {
    if (new Date() - this.lastCmd < debounceThresholdMillis) {
      debug('Debounced activate signal.');
      return;
    }
    debug('Received activate signal.');
    this.lastCmd = new Date();
    this.emit('activate');
  }

  // Listen for signals (on non-raspberry pi platorms).
  process.on('SIGUSR1', this.activate.bind(this));
  process.on('SIGUSR2', this.reset.bind(this));

  // TODO: Make sure this works on Raspberry pi.
  if (onoff) {
    // Pin 6
    var activate = new onoff.Gpio(17, 'in', 'rising');
    activate.watch(this.activate.bind(this));

    // Pin 8
    var reset = new onoff.Gpio(22, 'in', 'rising');
    reset.watch(this.reset.bind(this));
  }
}
util.inherits(Panel, events.EventEmitter);

module.exports = Panel;
