'use strict';


var Camera = function() {

}

// Static
Camera.isPresent = function() {
  throw new Error('isPresent must be implemented by subclasses.');
}

/**
 * Captures a photo, writes it to local disk, returns a promise of a
 * readable stream.
 */
Camera.prototype.takePhoto = function() {
  throw new Error('takePhoto must be implemented by subclasses.');
}

module.exports = Camera;
