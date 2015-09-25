'use strict';


var Camera = function() {

}

// Static
Camera.isPresent = function() {
  throw new Error('isPresent must be implemented by subclasses.');
}

/**
 * Captures a photo, writes it to local disk, returns a promise of a
 * path to the captured file.  Callers are responsible for cleaning up the file
 * when finished.
 */
Camera.prototype.takePhoto = function() {
  throw new Error('takePhoto must be implemented by subclasses.');
}

/**
 * Captures a preview photo, writes it to local disk, returns a promise of a
 * path to the captured file. Callers are responsibile for cleaning up the file.
 */
Camera.prototype.takePreview = function() {
  throw new Error('takePreview must be implemented by subclasses.');
}

module.exports = Camera;
