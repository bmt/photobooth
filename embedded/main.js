'use strict';

require('./config/init')();

var config = require('./config/config'),
    promise = require('bluebird'),
    debug = require('debug')('main'),
    process = require('process'),
    fs = require('fs'),
    gm = require('gm'),
    getCamera = require('./cameras/factory'),
    Panel = require('./panel'),
    Server = require('./server'),
    Interface = require('./interface'),
    Photobooth = require('./photobooth');

// Emits 'reset' and 'activate' when buttons are pressed.
var panel = new Panel();
var camera = getCamera();
var server = new Server();
var ui = new Interface(server.getSocket());

// Continue running "forever".
function forever() {
  setTimeout(forever, 1000);
}

// Does a graceful shutdown of all components.
function onExit(opt_code) {
  if (opt_code === undefined) {
    opt_code = 1;
  }
  server.close();
  panel.cleanup();
  ui.close();
  camera.reset().then(function() {
    process.exit(opt_code);
  });
}
process.on('SIGINT', onExit);
process.on('exit', onExit);

// Exits gracefully with the given exit code.
function exit(opt_code) {
  onExit(opt_code);
}

// Log uncaught exceptions
process.on('uncaughtException', function (err) {
  console.error(
    (new Date()).toUTCString() + ' uncaughtException:', err.message);
  console.trace(err);
  exit(1);
});

// Runs a test graphicsmagick command to make sure it is installed.
function verifyGm() {
  var defer = promise.pending();
  debug('Testing graphicsmagick.');
  gm("cameras/testdata/0.jpg").identify(function(err, value) {
    if (err) {
      console.trace(err);
      console.error('Unable to verify graphicsmagic -- is it installed?');
      defer.reject();
    } else {
      debug('Graphicsmagic OK.');
      defer.resolve();
    }
  });
  return defer.promise;
}

function verifyInterface() {
  var defer = promise.pending();
  fs.access(config.interface.path, fs.X_OK, function(err) {
    if (err) {
      console.trace(err);
      console.error('Interface not executable: ' + config.interface.path);
      defer.reject();
    }
    defer.resolve();
  });
  return defer.promise;
}

function verifyFrontend() {
  // TODO: Verify that frontend is available where configured.
  return promise.resolve();
}

function verifyCloudStorage() {
  // TODO: Verify cloud storage is available.
  return promise.resolve();
}

if (require.main === module) {
  var checks = [
    verifyInterface(),
    verifyGm(),
    verifyFrontend(),
    verifyCloudStorage()
  ];
  promise.all(checks).then(function() {
    debug('Initializing.');
    ui.start();
    var booth = new Photobooth(panel, camera, ui, server);
    booth.run();
    forever();
  });
}
