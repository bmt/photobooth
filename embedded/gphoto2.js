'use strict'

var promise = require('bluebird'),
    exec = require('child_process').exec;

exports.takePhoto = function(path) {
  var deferred = promise.pending();
  exec('/opt/local/bin/gphoto2 --capture-image-and-download --filename=' + path,
      function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(path);
        }
      });
  return deferred.promise;
};
