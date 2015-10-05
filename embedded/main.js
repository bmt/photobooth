'use strict';

var configInit = require('./config/init')(),
    config = require('./config/config'),
    promise = require('bluebird'),
    debug = require('debug')('main'),
    process = require('process'),
    config = require('./config/config'),
    fs = require('fs'),
    gcloud = require('gcloud')({
      projectId: config.google.project,
      keyFilename: config.google.keyFilename,
    }),
    gm = require('gm'),
    request = require('request-promise'),
    tmp = require('tmp'),
    util = require('util'),
    getCamera = require('./cameras/factory'),
    Panel = require('./panel'),
    Server = require('./server'),
    Interface = require('./interface');

promise.longStackTraces();

var camera,
    pendingInterval,
    pendingTimeout,
    pendingPromise,
    previewInstance,
    photos = [],
    finishedPhoto;

exports.strip = null;
exports.state = '';

// Emits 'reset' and 'activate' when buttons are pressed.
var panel = new Panel();
var camera = getCamera();
var previewServer = new Server();
var ui = new Interface(previewServer.getSocket());

function handleError(err) {
  console.trace(err);
  error();
}

function transition(state) {
  debug('Transitioning: ' + exports.state + ' -> ' + state);
  pendingTimeout && clearTimeout(pendingTimeout);
  pendingInterval && clearInterval(pendingInterval);
  pendingPromise && pendingPromise.cancel();
  panel.removeAllListeners('activate');
  exports.state = state;
}

function resetPhotos() {
  if (photos.length) {
    photos.forEach(function(path) {
      fs.unlink(path);
    });
    photos = [];
  }

  if (finishedPhoto) {
    fs.unlink(finishedPhoto);
    finishedPhoto = null;
  }
}

function idle() {
  transition('idle');
  resetPhotos();
  ui.idle();
  panel.on('activate', preview);
}

function preview() {
  transition('preview');
  resetPhotos();
  panel.on('activate', pending);

  previewInstance = camera.openPreview();
  previewServer.setSourceStream(previewInstance.stream);
  ui.preview();

  // Timeout back to idle after 2 minutes.
  pendingTimeout = setTimeout(idle, 1000*60*2);  // 2 minutes.
}

function pending() {
  transition('pending');
  var secondsRemaining = config.countdown;
  previewInstance = camera.openPreview();
  previewServer.setSourceStream(previewInstance.stream);

  // Called every second by tick().
  function updateUI() {
    ui.pending(secondsRemaining, photos);
  }
  updateUI();

  // Count down to 0.
  function tick() {
    --secondsRemaining;
    updateUI();
    if (secondsRemaining) {
      pendingTimeout = setTimeout(tick, 1000);
    } else {
      capture();
    }
  }
  pendingTimeout = setTimeout(tick, 1000);
}

function capture() {
  transition('capture');
  pendingPromise = camera.takePhoto().then(function(photo) {
    photos.push(photo);
    if (photos.length == 3) {
      postProcess();
    } else {
      pending();
    }
  }, handleError);
}

function joinImages(photos) {
  var deferred = promise.pending();
  var tmpfile = tmp.tmpName(function(err, path) {
    var destPath = path + '.jpg';
    debug('Writing montage to ' + destPath);

    // Join them together in a vertical strip with 10px padding and resize to
    // max width of 1024.  I had to use the manually constructed command because
    // otherwise .geometry() is added after input arguments and doesn't actually
    // set the maximum tile size.
    var cmd = gm(photos[2])
      .command('montage')
      .in('-geometry')
      .in('+10+10')
      .in(photos[0])
      .in(photos[1])
      .resize('1220')
      .write(destPath, function() {
        deferred.resolve(destPath);
      });
  });
  return deferred.promise;
}

function uploadToStorage(path) {
  var deferred = promise.pending();
  var gcs = gcloud.storage();
  var bucket = gcs.bucket(config.google.storageBucket);
  // TODO: Better file name (no tmp in name)
  //       Better bucket name (no bmt in bucket name)
  bucket.upload(path, function(err, file) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve({bucket: file.metadata.bucket,
                        name: file.metadata.name});
    }
    finishedPhoto = path;
  });
  return deferred.promise;
}

function recordInFrontend(storageInfo) {
  return request.post(config.frontend.host + '/photos').form(storageInfo)
    .then(JSON.parse)
    .then(null, handleError);
}

function printReceipt(photo) {
  console.info('Photo available at: ' + config.frontend.host +
      '#!/photo/' + photo._id);

  // TODO: Print receipt
  return promise.resolve();
}

function postProcess() {
  transition('postProcess');
  ui.processing(photos);
  joinImages(photos)
    .then(uploadToStorage)
    .then(recordInFrontend)
    .then(printReceipt)
    .then(finished)
    .then(null, handleError);
}

function error() {
  transition('error');
  ui.error();
  pendingTimeout = setTimeout(idle, 1000*60*1);
}

function finished() {
  transition('finished');
  ui.finished(finishedPhoto);
  pendingTimeout = setTimeout(idle, 1000*60*1);
  panel.on('activate', preview);
}

function init() {
  transition('init');
  panel.on('reset', idle);
  setImmediate(idle);
}
exports.init = init;

function forever() {
  setTimeout(forever, 1000);
}

// On exit.
function onExit(opt_code) {
  if (opt_code == undefined) {
    opt_code = 1;
  }
  previewServer.close();
  ui.close();
  process.exit(opt_code);
}
process.on('SIGINT', onExit);
process.on('exit', onExit);

function exit(opt_code) {
  onExit(opt_code);
}

// Log uncaught exceptions
process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
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
    init();
    forever();
  }, function(err) {
    if (err) {
      console.trace(err);
    }
    exit(1);
  });
}
