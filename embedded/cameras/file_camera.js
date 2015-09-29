'use strict';

var promise = require('bluebird'),
    fs = require('fs'),
    tmp = require('tmp'),
    debug = require('debug')('camera'),
    stream = require('stream'),
    util = require('util'),
    PreviewHandle = require('./previewHandle');

var FileCamera = function() {
  this.nextPhoto = 0;
  this.preview = null;
};

FileCamera.prototype.takePhoto = function() {
  function takePhotoImpl() {
    var deferred = promise.pending();
    var srcPath = 'cameras/testdata/' + this.nextPhoto + '.jpg';
    var tmpfile = tmp.tmpName(function(err, path) {
      var src = fs.createReadStream(srcPath);
      var imgpath = path + '.jpg';
      var target = fs.createWriteStream(imgpath);
      src.pipe(target, {end: false});
      src.on('close', function() {
        deferred.resolve(imgpath);
      });
    });
    this.nextPhoto = ++this.nextPhoto % 3;
    return deferred.promise;
  }

  // TODO: Refactor this into a subclass.
  if (this.preview) {
    return this.preview.close().then(takePhotoImpl.bind(this));
  } else {
    return takePhotoImpl();
  }
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
