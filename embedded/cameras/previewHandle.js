'use strict';

var promise = require('bluebird');

/**
 * A handle to a particular preview stream (and potentially process)
 * Callers to openPreview should call close() when finished with preview.
 * The preview will also be closed when takePhoto is called.
 */
module.exports = function(stream, process) {
  this.stream = stream;
  this.process = process;
  this.open = true;
  this.close = function() {
    if (this.process && this.open) {
      this.open = false;
      var deferred = promise.pending();
      this.process.on('exit', deferred.resolve.bind(deferred));
      this.process.kill();
      return deferred.promise;
    } else {
      return promise.resolve();
    }
  };
};
