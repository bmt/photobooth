'use strict';

var promise = require('bluebird'),
    fs = require('fs'),
    tmp = require('tmp'),
    stream = require('stream'),
    util = require('util');

var FileCamera = function() {
  this.nextPhoto = 0;
  this.preview = null;
};

FileCamera.prototype.takePhoto = function() {
  if (this.preview) {
    this.preview.close();
  }

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
};

var Preview = function(stream, process) {
  this.stream = stream;
  this.process = process;
  this.open = true;
  this.close = function() {
    this.open = false;
    if (this.process) {
      this.process.kill();
    }
  }
};

FileCamera.prototype.openPreview = function() {
  if (this.preview && this.preview.open) {
    return this.preview;
  }
  var srcPath = 'cameras/testdata/movie.mjpg';
  // TODO: Continually read the file over and over again.
  var fileStream = fs.createReadStream(srcPath);
  this.preview = new Preview(fileStream);
  return this.preview;
};

// Static
FileCamera.isPresent = function() {
  return true;
};

module.exports = FileCamera;
