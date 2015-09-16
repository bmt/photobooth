'use strict'

var gphoto = require('./gphoto2'),
    tmp = require('tmp');

var tmpfile = tmp.tmpName(function(err, path) {
  console.info('Taking photo: ' + path + '.jpg');
  gphoto.takePhoto(path + '.jpg').then(function(path) {
    console.info('Took photo: ' + path);
  }).catch(function(err) {
    console.error('Photo error: ' + err);
  });
});




