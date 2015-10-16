'use strict';

var promise = require('bluebird');

var Camera = function() {
  this.preview = null;
};

Camera.prototype.reset = function() {
  if (this.preview) {
    return this.preview.close();
  } else {
    return promise.resolve();
  }
};

Camera.prototype.takePhotoImpl = function() {
  throw new Error('Subclasses must implement takePhotoImpl.');
};

Camera.prototype.takePhoto = function() {
  var camera = this;
  return this.reset().then(function() {
    return promise.resolve(camera.takePhotoImpl());
  });
};

Camera.prototype.downloadPhotoImpl = function(photo) {
  throw new Error('Subclasses must implement downloadPhotoImpl');
};

Camera.prototype.openPreviewImpl = function() {
  throw new Error('Subclasses must implement openPreviewImpl.');
};

Camera.prototype.openPreview = function() {
  if (this.preview && this.preview.open) {
    return this.preview;
  }
  this.preview = this.openPreviewImpl();
  return this.preview;
};

module.exports = Camera;
