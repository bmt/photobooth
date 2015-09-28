'use strict';

var Logitech = function() {}


// Static
Logitech.isPresent = function() {
  return false;
}

Logitech.prototype.takePhoto = function() {
  // TODO: Implmement
  throw new Error('Unimplemented');
}

Logitech.prototype.takePreview = function() {
  // TODO: Implmement
  throw new Error('Unimplemented');
}

module.exports = Logitech;
