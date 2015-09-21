'use strict';

var Camera = require('./camera'),
    promise = require('bluebird'),
    fs = require('fs'),
    util = require('util');

var FileCamera = function() {
  this.nextPhoto = 0;
};
util.inherits(FileCamera, Camera);

FileCamera.prototype.takePhoto = function() {
  var stream = fs.createReadStream(
      'cameras/testdata/' + this.nextPhoto + '.jpg');
  this.nextPhoto = (this.nextPhoto + 1) % 3;
  return promise.resolve(stream);
};

// Static
FileCamera.isPresent = function() {
  return true;
};


module.exports = FileCamera;
