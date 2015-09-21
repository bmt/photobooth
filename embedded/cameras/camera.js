'use strict';


var Camera = function() {

}

/**
 * Captures a photo, writes it to local disk, returns a promise of a
 * readable stream.
 */
Camera.prototype.takePhoto = function() {
  throw new Error('takePhoto must be implemented by subclasses.');
}

module.exports = Camera;
