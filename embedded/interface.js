'use strict';

var spawn = require('child_process').spawn,
    config = require('./config/config'),
    debug = require('debug')('interface'),
    process = require('process'),
    _ = require('lodash');

var InterfaceMode = {
  IDLE: '0',
  PREVIEW: '1',
  PENDING: '2',
  CAPTURE: '3',
  PROCESSING: '4',
  FINISHED: '5',
  ERROR: '6',
  UNKNOWN: '7',
};

var Interface = function(socket) {
  this.restartCount_ = 0;
  this.socket = socket;
  this.process = null;
  this.stopped = false;
};

Interface.prototype.start = function() {
  this.stopped = false;
  this.spawnInterfaceProcess();
};

Interface.prototype.close = function() {
  this.stopped = true;
  if (this.process) {
    this.process.kill();
  }
};

Interface.prototype.sendLastCommand = function() {
  if (this.lastCommand) {
    this.sendCommand(this.lastCommand);
  }
};

Interface.prototype.spawnInterfaceProcess = function() {
  // Start the process
  var p = spawn(config.interface.path, [this.socket]);
  p.on('error', this.onError.bind(this));
  p.on('exit', this.onExit.bind(this));
  p.stdin.on('error', function() {
    process.exit(0);
  });
  p.stdout.on('error', function() {
    process.exit(0);
  });
  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);
  this.process = p;
  // This delay is necessary because the interface doesn't listen to stdin until
  // after setting up everything else.  If I change that, I can remove this
  // delay.
  setTimeout(this.sendLastCommand.bind(this), 2000);
};

Interface.prototype.onError = function(err) {
  console.error('Interface failure.');
  console.trace(err);
  this.process = null;
};

Interface.prototype.onExit = function() {
  console.error('interface exited.');
  this.process = null;
  if (!this.stopped) {
    this.restart();
  }
};

Interface.prototype.restart = function() {
  this.restartCount_++;
  if (this.restartCount_ <= config.interface.maxRestarts) {
    debug('Attempting restart,  attempt ' + this.restartCount_);
    this.spawnInterfaceProcess();
  } else {
    console.error('Interface failure: too many restarts.');
  }
};

Interface.prototype.sendCommand = function(mode, args) {
  var cmd = mode;
  if (args) {
    cmd += '\t';
    cmd += args.join('\t');
  }
  this.lastCommand = cmd;

  debug('Cmd: ' + cmd);
  if (this.process) {
    this.process.stdin.write(cmd + '\n');
  } else {
    console.error('Interface process not availble.');
  }
};

Interface.prototype.idle = function(randomImage) {
  var args = [];
  if (randomImage) {
    args.push(randomImage);
  }
  this.sendCommand(InterfaceMode.IDLE, args);
};

Interface.prototype.preview = function() {
  this.sendCommand(InterfaceMode.PREVIEW);
};

Interface.prototype.pending = function(time, images) {
  this.sendCommand(InterfaceMode.PENDING,
      _.flatten([time, images]));
};

Interface.prototype.capture = function(images) {
  this.sendCommand(InterfaceMode.CAPTURE,
      _.flatten(images));
};

Interface.prototype.processing = function(images, msg) {
  this.sendCommand(InterfaceMode.PROCESSING, _.flatten([images, msg]));
};

Interface.prototype.finished = function(image, url) {
  this.sendCommand(InterfaceMode.FINISHED, [image, url]);
};

Interface.prototype.error = function() {
  this.sendCommand(InterfaceMode.ERROR);
};

module.exports = Interface;
