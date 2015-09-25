'use strict';

var promise = require('bluebird'),
    tmp = require('tmp'),
    fs = require('fs'),
    Camera = require('./camera'),
    exec = require('child_process').exec,
    util = require('util');

var gphoto = '/opt/local/bin/gphoto2';

var Canon = function() {
}
util.inherits(Canon, Camera);

// Static
Canon.isPresent = function() {
  // TODO: Implement
  return false;
}

Canon.prototype.takePhoto = function() {
  var deferred = promise.pending();
  var tmpfile = tmp.tmpName(function(err, path) {
    console.info('Taking photo: ' + path + '.jpg');
    exec(gphoto + ' --capture-image-and-download --filename=' + path,
        function(err, stdout, stderr) {
          console.log(stdout);
          console.log(stderr);
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(path);
          }
        });
  });
  return deferred.promise;
};

Canon.prototype.takePreview = function() {
  // TODO: Implement
  return promise.reject();
};

module.exports = Canon;

