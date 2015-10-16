'use strict';

require('./config/init')();

var config = require('./config/config'),
    promise = require('bluebird'),
    debug = require('debug')('main'),
    process = require('process'),
    fs = require('fs'),
    gcloud = require('gcloud')({
      projectId: config.google.project,
      keyFilename: config.google.keyFilename,
    }),
    gm = require('gm'),
    getCamera = require('./cameras/factory'),
    request = require('request-promise'),
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
  if (camera) {
    camera.reset().then(function() {
      process.exit(opt_code);
    });
  }
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
  debug('Verifying interface: ' + config.interface.path);
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
  debug('Verifying frontend configuration: ' + config.frontend.host);
  return request.get(config.frontend.host).then(function(data) {
    debug('Frontend OK');
    return data;
  }, function(err) {
    console.trace(err);
    throw new Error('Frontend not available ' + config.frontend.host);
  });
}

function verifyCloudStorage() {
  debug('Verifying google cloud storage connection.');
  var defer = promise.pending();
  var gcs = gcloud.storage();
  gcs.getBuckets(function(err, buckets) {
    if (err) {
      console.trace(err);
      defer.reject(new Error('Cloud storage not available'));
    } else {
      debug('Cloud storage OK');
      defer.resolve();
    }
  });
  return defer.promise;
}

function verifyCamera() {
  if (camera === null) {
    return promise.reject(new Error('No camera found.'));
  } else {
    return promise.resolve();
  }
}

if (require.main === module) {
  if (camera === null) {
    console.error('No camera found.');

  }
  var checks = [
    verifyCamera(),
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
  }, function(e) {
    console.error(e);
    console.error('Initialization failed.');
    exit(1);
  });
}
