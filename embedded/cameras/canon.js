'use strict';

var promise = require('bluebird'),
    tmp = require('tmp'),
    util = require('util'),
    debug = require('debug')('camera'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    Camera = require('./camera'),
    PreviewHandle = require('./previewHandle');

var gphoto = '/opt/local/bin/gphoto2';

var Canon = function() {};
util.inherits(Canon, Camera);

// Static
Canon.isPresent = function() {
  // TODO: Implement
  return false;
};

Canon.prototype.takePhotoImpl = function() {
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
            console.trace(err);
            deferred.reject(err);
          } else {
            deferred.resolve(dest);
          }
        });
  });
  return deferred.promise;
};

Canon.prototype.openPreviewImpl = function() {
  debug('Opening preview stream.');
  var movie = spawn(gphoto, ['--capture-movie', '--stdout']);
  return new PreviewHandle(movie.stdout, movie);
};

module.exports = Canon;

