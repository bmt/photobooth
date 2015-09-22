'use strict';

var Camera = require('./camera'),
    promise = require('bluebird'),
    fs = require('fs'),
    tmp = require('tmp'),
    util = require('util');

var FileCamera = function() {
  this.nextPhoto = 0;
};
util.inherits(FileCamera, Camera);

FileCamera.prototype.takePhoto = function() {
  var deferred = promise.pending();
  var srcPath = 'cameras/testdata/' + this.nextPhoto + '.jpg';
  var tmpfile = tmp.tmpName(function(err, path) {
    var src = fs.createReadStream(srcPath);
    var target = fs.createWriteStream(path);
    src.pipe(target);
    src.on('close', function() {
      deferred.resolve(path);
    });
  });
  this.nextPhoto = ++this.nextPhoto % 3;
  return deferred.promise;
};

// Static
FileCamera.isPresent = function() {
  return true;
};


module.exports = FileCamera;
