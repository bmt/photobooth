'use strict';

var spawn = require('child_process').spawn,
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
}

var Interface = function(socket) {
  // Start the process
  var uiProcess = spawn('../interface/bin/pbInterfaceDebug.app/Contents/MacOS/pbInterfaceDebug', [socket]);

  uiProcess.on('error', function(err) {
    console.trace(err);
  });

  uiProcess.on('exit', function() {
    console.error('interface exited');
  });

  uiProcess.stdout.pipe(process.stdout);
  uiProcess.stderr.pipe(process.stderr);

  function sendCommand(mode, args) {
    var cmd = mode;
    if (args) {
      cmd += '\t';
      cmd += args.join('\t');
    }
    debug('Cmd: ' + cmd);
    uiProcess.stdin.write(cmd + '\n');
  }

  this.idle = function() {
    sendCommand(InterfaceMode.IDLE);
  };

  this.preview = function(previewPath) {
    sendCommand(InterfaceMode.PREVIEW, [previewPath]);
  };

  this.pending = function(time, previewPath, images) {
    sendCommand(InterfaceMode.PENDING,
        _.flatten([time, previewPath, images]));
  };

  this.processing = function(previewPath, images) {
    sendCommand(InterfaceMode.PROCESSING, _.flatten([previewPath, images]));
  };

  this.finished = function(image) {
    sendCommand(InterfaceMode.FINISHED, [image]);
  };

  this.error = function() {
    sendCommand(InterfaceMode.ERROR);
  };
};

module.exports = Interface;
