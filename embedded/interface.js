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
  PROCESSING: '3',
  FINISHED: '4',
  ERROR: '5',
  UNKNOWN: '6',
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
  debug('Cmd: ' + cmd);
  if (this.process) {
    this.process.stdin.write(cmd + '\n');
  } else {
    console.error('Interface process not availble.');
  }
};

Interface.prototype.idle = function() {
  this.sendCommand(InterfaceMode.IDLE);
};

Interface.prototype.preview = function() {
  this.sendCommand(InterfaceMode.PREVIEW);
};

Interface.prototype.pending = function(time, images) {
  this.sendCommand(InterfaceMode.PENDING,
      _.flatten([time, images]));
};

Interface.prototype.processing = function(images) {
  this.sendCommand(InterfaceMode.PROCESSING, images);
};

Interface.prototype.finished = function(image) {
  this.sendCommand(InterfaceMode.FINISHED, [image]);
};

Interface.prototype.error = function() {
  this.sendCommand(InterfaceMode.ERROR);
};

module.exports = Interface;
