'use strict';

var promise = require('bluebird'),
    fs = require('fs'),
    tmp = require('tmp'),
    util = require('util'),
    Camera = require('./camera'),
    PreviewHandle = require('./previewHandle');

var FakeCamera = function() {
  Camera.call(this);
  this.nextPhoto = 0;
  this.preview = null;
};
util.inherits(FakeCamera, Camera);

FakeCamera.prototype.takePhotoImpl = function() {
  var deferred = promise.pending();
  var srcPath = 'cameras/testdata/' + this.nextPhoto + '.jpg';
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
  this.nextPhoto = ++this.nextPhoto % 4;
  return deferred.promise;
};

FakeCamera.prototype.openPreviewImpl = function() {
  var srcPath = 'cameras/testdata/movie.mjpg';
  // TODO: Continually read the file over and over again.
  return new PreviewHandle(fs.createReadStream(srcPath));
};

// Static
FakeCamera.isPresent = function() {
  return true;
};

module.exports = FakeCamera;
