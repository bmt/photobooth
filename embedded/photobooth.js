'use strict';

var config = require('./config/config'),
    promise = require('bluebird'),
    debug = require('debug')('photobooth'),
    fs = require('fs'),
    gcloud = require('gcloud')({
      projectId: config.google.project,
      keyFilename: config.google.keyFilename,
    }),
    gm = require('gm'),
    moment = require('moment'),
    request = require('request-promise'),
    tmp = require('tmp');

function joinImages(photos) {
  var deferred = promise.pending();
  tmp.tmpName(function(err, path) {
    var destPath = path + '.jpg';
    debug('Writing montage to ' + destPath);

    // Join them together in a vertical strip with 10px padding and resize to
    // max width of 1024.  I had to use the manually constructed command because
    // otherwise .geometry() is added after input arguments and doesn't actually
    // set the maximum tile size.
    gm(photos[2]).command('montage')
      .in('-geometry')
      .in('+10+10')
      .in(photos[0])
      .in(photos[1])
      .write(destPath, function() {
        deferred.resolve(destPath);
      });
  });
  return deferred.promise;
}

function uploadToStorage(path) {
  debug('Uploading to cloud storage.');
  var deferred = promise.pending();
  var gcs = gcloud.storage();
  var bucket = gcs.bucket(config.google.storageBucket);

  var filename = ('photobooth-' +
      moment().format('YYYYMMDD-hhmmss-SSS' + '.jpg'));
  var options = {
    destination: filename
  };
  bucket.upload(path, options, function(err, file) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve({bucket: file.metadata.bucket,
                        name: file.metadata.name});
    }
  });
  return deferred.promise;
}

function recordInFrontend(storageInfo) {
  debug('Recording in frontend.');
  return request.post(config.frontend.host + '/photos').form(storageInfo)
    .then(JSON.parse);
}

function printReceipt(photo) {
  debug('Printing receipt.');
  var url = config.frontend.host + '/' + photo._id;
  console.info('Photo available at: ' + url);

  // TODO: Print receipt
  return promise.resolve(url);
}

var Photobooth = function(panel, camera, ui, server) {
  var pendingInterval,
      pendingTimeout,
      pendingPromise,
      previewHandle,
      photos = [],
      currentState = '',
      finishedPhoto;

  function handleError(err) {
    console.trace(err);
    error();
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

  function transition(newState) {
    debug('Transitioning: ' + currentState + ' -> ' + newState);
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
    }
    if (pendingInterval) {
      clearInterval(pendingInterval);
    }
    if (pendingPromise) {
      pendingPromise.cancel();
    }
    panel.removeAllListeners('activate');
    currentState = newState;
  }

  // State -> idle
  function idle() {
    transition('idle');
    resetPhotos();
    ui.idle();
    panel.on('activate', preview);
  }

  // State -> preview
  function preview() {
    transition('preview');
    resetPhotos();
    panel.on('activate', pending);

    previewHandle = camera.openPreview();
    server.setSourceStream(previewHandle.stream);
    ui.preview();

    // Timeout back to idle after 2 minutes.
    pendingTimeout = setTimeout(idle, 1000*60*2);  // 2 minutes.
  }

  // State -> pending
  function pending() {
    transition('pending');
    var secondsRemaining = config.countdown;
    previewHandle = camera.openPreview();
    server.setSourceStream(previewHandle.stream);

    pendingPromise = previewHandle.ready;
    previewHandle.ready.then(function() {
      // Initialize UI and then count down to zero.
      ui.pending(secondsRemaining, photos);
      function tick() {
        --secondsRemaining;
        ui.pending(secondsRemaining, photos);
        if (secondsRemaining) {
          pendingTimeout = setTimeout(tick, 1000);
        } else {
          capture();
        }
      }
      pendingTimeout = setTimeout(tick, 1000);
    });
  }

  // State -> capture
  function capture() {
    transition('capture');
    pendingPromise = camera.reset()
      .tap(function() {
        ui.capture(photos);
      })
      .then(camera.takePhoto.bind(camera))
      .then(function(photo) {
        photos.push(photo);
        if (photos.length == 3) {
          // Make sure the new photo is shown.
          ui.capture(photos);
          processing();
        } else {
          // Make sure the new photo is shown.
          ui.capture(photos);
          pending();
        }
      }, handleError);
  }

  // State -> processing
  function processing() {
    transition('processing');
    ui.processing(photos, "Composing images");
    joinImages(photos)
      .then(function(path) {
        finishedPhoto = path;
        return promise.resolve(path);
      })
      .tap(function() {
        ui.processing(photos, "Uploading");
      })
      .then(uploadToStorage)
      .tap(function() {
        ui.processing(photos, "Recording photo data");
      })
      .then(recordInFrontend)
      .tap(function() {
        ui.processing(photos, "Printing receipt");
      })
      .then(printReceipt)
      .then(finished)
      .then(null, handleError);
  }

  // State -> error
  function error() {
    transition('error');
    ui.error();
    pendingTimeout = setTimeout(idle, 1000*60*1);
  }

  // State -> finished
  function finished(url) {
    transition('finished');
    ui.finished(finishedPhoto, url);
    pendingTimeout = setTimeout(idle, 1000*60*1);
    panel.on('activate', preview);
  }

  this.run = function() {
    transition('init');
    panel.on('reset', idle);
    setImmediate(idle);
  };
};
module.exports = Photobooth;
