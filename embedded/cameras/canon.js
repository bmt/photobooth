'use strict';

var promise = require('bluebird'),
    tmp = require('tmp'),
    debug = require('debug')('camera'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    PreviewHandle = require('./previewHandle');

var gphoto = '/opt/local/bin/gphoto2';

var Canon = function() {};

// Static
Canon.isPresent = function() {
  // TODO: Implement
  return false;
};

// Returns a promise.
Canon.prototype.reset = function() {
  if (this.preview) {
    return this.preview.close();
  } else {
    return promise.resolve();
  }
};

Canon.prototype.takePhoto = function() {
  function takePhotoImpl() {
    var deferred = promise.pending();
    tmp.tmpName(function(err, path) {
      var dest = path + '.jpg';
      debug('Taking photo: ' + dest);
      // TODO: Handle failures properly...this doesn't reset when half-press
      // fails like on Amanda's Camera with the borken flash.
      exec(gphoto + ' --capture-image-and-download --filename=' + dest,
          function(err, stdout, stderr) {
            debug(stdout);
            debug(stderr);
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(dest);
            }
          });
    });
    return deferred.promise;
  }

  // TODO: Refactor this into a subclass.
  return this.reset().then(takePhotoImpl.bind(this));
};

Canon.prototype.openPreview = function() {
  if (this.preview && this.preview.open) {
    return this.preview;
  }
  
  debug('Opening preview stream.');
  var movie = spawn(gphoto, ['--capture-movie', '--stdout']);
  this.preview = new PreviewHandle(movie.stdout, movie);
  return this.preview;
};

module.exports = Canon;

