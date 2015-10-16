'use strict';
var config = require('../config/config'),
    Canon = require('./canon'),
    Logitech = require('./logitech'),
    FakeCamera = require('./fake_camera');

module.exports = function() {
  console.info('Checking for available cameras.');
  // Check for canon camera
  if (Canon.isPresent()) {
    console.info('Canon camera found!');
    return new Canon();
  } else {
    console.info('Canon camera not found.');
  }

  // Check for webcam
  if (Logitech.isPresent()) {
    console.info('Logitech webcam found!');
    return new Logitech();
  } else {
    console.info('Logitech webcam not found.');
  }

  // Fall back to fake camera for dev.
  if (config.env === 'development') {
    console.info('No camera found, falling back to fake camera.');
    return new FakeCamera();
  } else {
    return null;
  }
};
