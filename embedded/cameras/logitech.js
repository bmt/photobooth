'use strict';

var Camera = require('./camera'),
    util = require('util');


var Logitech = function() {
}
util.inherits(Logitech, Camera);


// Static
Logitech.isPresent = function() {
  return false;
}

Logitech.prototype.takePhoto = function() {
  // TODO: Implmement
  throw new Error('Unimplemented');
}

module.exports = Logitech;
