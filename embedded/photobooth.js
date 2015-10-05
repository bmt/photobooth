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
      .resize('1220')
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
  // TODO: Better file name (no tmp in name)
  //       Better bucket name (no bmt in bucket name)
  bucket.upload(path, function(err, file) {
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
  console.info('Photo available at: ' + config.frontend.host +
      '#!/photo/' + photo._id);

  // TODO: Print receipt
  return promise.resolve();
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
  }

  // State -> capture
  function capture() {
    transition('capture');
    pendingPromise = camera.takePhoto().then(function(photo) {
      photos.push(photo);
      if (photos.length == 3) {
        processing();
      } else {
        pending();
      }
    }, handleError);
  }

  // State -> processing
  function processing() {
    transition('processing');
    ui.processing(photos);
    joinImages(photos)
      .then(function(path) {
        debug('GM Finished: ' + path);
        finishedPhoto = path;
        return promise.resolve(path);
      }).then(uploadToStorage)
      .then(recordInFrontend)
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
  function finished() {
    transition('finished');
    ui.finished(finishedPhoto);
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
