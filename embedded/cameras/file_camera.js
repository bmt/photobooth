'use strict';

var promise = require('bluebird'),
    fs = require('fs'),
    tmp = require('tmp'),
    PreviewHandle = require('./previewHandle');

var FileCamera = function() {
  this.nextPhoto = 0;
  this.preview = null;
};

FileCamera.prototype.reset = function() {
  if (this.preview) {
    return this.preview.close();
  } else {
    return promise.resolve();
  }
};

FileCamera.prototype.takePhoto = function() {
  var camera = this;
  function takePhotoImpl() {
    var deferred = promise.pending();
    var srcPath = 'cameras/testdata/' + camera.nextPhoto + '.jpg';
    tmp.tmpName(function(err, path) {
      var src = fs.createReadStream(srcPath);
      var imgpath = path + '.jpg';
      var target = fs.createWriteStream(imgpath);
      src.pipe(target, {end: false});
      src.on('close', function() {
        // Simulate camera delay.
        setTimeout(deferred.resolve.bind(deferred, imgpath), 2000);
      });
    });
    camera.nextPhoto = ++camera.nextPhoto % 3;
    return deferred.promise;
  }

  // TODO: Refactor this into a subclass.
  return this.reset().then(takePhotoImpl.bind(this));
};

FileCamera.prototype.openPreview = function() {
  if (this.preview && this.preview.open) {
    return this.preview;
  }
  var srcPath = 'cameras/testdata/movie.mjpg';
  // TODO: Continually read the file over and over again.
  var fileStream = fs.createReadStream(srcPath);
  this.preview = new PreviewHandle(fileStream);
  return this.preview;
};

// Static
FileCamera.isPresent = function() {
  return true;
};

module.exports = FileCamera;
