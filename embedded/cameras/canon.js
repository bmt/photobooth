'use strict';

var promise = require('bluebird'),
    tmp = require('tmp'),
    fs = require('fs'),
    debug = require('debug')('camera'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    util = require('util'),
    PreviewHandle = require('./previewHandle');

var gphoto = '/opt/local/bin/gphoto2';

var Canon = function() {}

// Static
Canon.isPresent = function() {
  // TODO: Implement
  return false;
}

Canon.prototype.takePhoto = function() {
  function takePhotoImpl() {
    var deferred = promise.pending();
    var tmpfile = tmp.tmpName(function(err, path) {
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
  if (this.preview) {
    return this.preview.close().then(takePhotoImpl.bind(this));
  } else {
    return takePhotoImpl();
  }
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

