'use strict';

var events = require('events'),
    process = require('process'),
    util = require('util');

// This only works on the raspberry pi.
try {
  var onoff = require('onoff');
} catch (e) {}

var Panel = function() {
  this.cleanup = function() {
    activate && activate.unexport();
    reset && reset.unexport();
  }

  this.reset = function() {
    console.info('Received reset signal.');
    this.emit('reset');
  }

  this.activate = function() {
    console.info('Received activate signal.');
    this.emit('activate');
  }

  // Listen for signals (on non-raspberry pi platorms).
  process.on('SIGUSR1', this.activate.bind(this));
  process.on('SIGUSR2', this.reset.bind(this));

  if (onoff) {
    // Pin 6
    var activate = new onoff.Gpio(17, 'in', 'rising');
    activate.watch(this.reset.bind(this));

    // Pin 8
    var reset = new onoff.Gpio(22, 'in', 'rising');
    reset.watch(this.reset.bind(this));
  }
}
util.inherits(Panel, events.EventEmitter);

module.exports = Panel;
