'use strict';

var timers = require('timers'),
    debug = require('debug')('main'),
    fs = require('fs'),
    gm = require('gm'),
    tmp = require('tmp'),
    util = require('util'),
    getCamera = require('./cameras/factory'),
    Panel = require('./panel');

var camera,
    timeout,
    promise,
    photos = []

exports.strip = null;
exports.state = '';

// Emits 'reset' and 'activate' when buttons are pressed.
var panel = new Panel();
var camera = getCamera();

function transition(state) {
  console.info('Transitioning: ' + exports.state + ' -> ' + state);
  timeout && timers.clearTimeout(timeout);
  promise && promise.cancel();
  panel.removeAllListeners('activate');
  exports.state = state;
}

function idle() {
  transition('idle');
  photos = [];

  // TODO: Show idle screen.
  // "Press button to begin"
  panel.on('activate', preview);
}

function preview() {
  transition('preview');

  // TODO: Show preview screen.
  // "Press button to start countdown"
  panel.on('activate', pending);
  var timeout = setTimeout(idle, 1000*60*2);  // 2 minutes.
}

function pending() {
  transition('pending');
  var secondsRemaining = 5;
  if (photos.length) {
    secondsRemaining = 10;
    // TODO: Show last photo.
  }
  function updateCountdown() {
    // TODO: Update countdown.
    console.info(secondsRemaining + ' seconds remaining.');
  }
  updateCountdown();

  // Count down to 0.
  function tick() {
    --secondsRemaining;
    if (secondsRemaining) {
      updateCountdown();
      timeout = setTimeout(tick, 1000);
    } else {
      capture();
    }
  }
  timeout = setTimeout(tick, 1000);
}

function capture() {
  transition('capture');
  // TODO: Take the picture
  promise = camera.takePhoto().then(function(photo) {
    photos.push(photo);
    if (photos.length == 3) {
      process();
    } else {
      pending();
    }
  });  // TODO: error handler
}

function process() {
  transition('process');
  var tmpfile = tmp.tmpName(function(err, path) {
    console.info('Writing montage to ' + path + '.jpg');
    var cmd = gm(photos[2])
      .command('montage')
      .in('-geometry')
      .in('+10+10')
      .in('-tile')
      .in('1x')
      .in(photos[0])
      .in(photos[1])
      .resize('1024x1024')
      .write(path + '.jpg', finished);
  });

  // TODO: Upload
  // TODO: Print ticket
  // exports.strip = url.
}

function finished() {
  transition('finished');
  // TODO: Show finished strip.
  timeout = setTimeout(idle, 1000*60*1);
}

function init() {
  transition('init');
  panel.on('reset', idle);
  setImmediate(idle);
}
exports.init = init;

function forever() {
  setTimeout(forever, 1000);
}

if (require.main === module) {
  init();
  forever();
}
