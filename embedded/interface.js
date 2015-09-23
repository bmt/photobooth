'use strict';

var spawn = require('child_process').spawn;

var InterfaceMode = {
  IDLE: '0',
  PREVIEW: '1',
  PENDING: '2',
  PROCESSING: '3',
  FINISHED: '4',
  ERROR: '5',
  UNKNOWN: '6',
}

var Interface = function() {
  // Start the process
  var uiProcess = spawn('../interface/bin/pbInterfaceDebug.app/Contents/MacOS/pbInterfaceDebug');

  uiProcess.on('error', function(err) {
    console.trace(err);
  });

  uiProcess.on('exit', function() {
    console.error('interface exited');
  });

  function sendCommand(mode) {
    uiProcess.stdin.write(mode + '\n');
  }

  this.idle = function() {
    sendCommand(InterfaceMode.IDLE);
  };

  this.preview = function() {
    sendCommand(InterfaceMode.PREVIEW);
  };
  
  this.pending = function() {
    sendCommand(InterfaceMode.PENDING);
  };

  this.processing = function() {
    sendCommand(InterfaceMode.PROCESSING);
  };

  this.finished = function() {
    sendCommand(InterfaceMode.FINISHED);
  };

  this.error = function() {
    sendCommand(InterfaceMode.ERROR);
  };
};

module.exports = Interface;
