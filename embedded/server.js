var net = require('net'),
    fs = require('fs'),
    tmp = require('tmp'),
    _ = require('lodash'),
    debug = require('debug')('server');

var Server = function() {
  var connections = [];
  var src = null;
  //var socket = tmp.tmpNameSync();
  var socket = '/var/run/photobooth/photobooth.video';
  var server = net.createServer(function(c) { //'connection' listener
    debug('Client connected.');
    c.on('end', function() {
      debug('Client disconnected.');
      if (src) {
        debug('Disconnecting pipe.');
        src.unpipe(c);
      }
      _.remove(connections, c);
    });
    connections.push(c);

    if (src) {
      debug('Connecting pipe.');
      src.pipe(c, {end: false});
    }
  });

  this.getSocket = function() {
    return socket;
  }

  server.listen(socket, function() {
    debug('Server listening to path: ' + socket);
  });

  this.setSourceStream = function(readable) {
    if (src != readable) {
      if (src) {
        connections.forEach(src.unpipe.bind(src));
      }
      src = readable;
      connections.forEach(function(c) {
        src.pipe(c, {end: false});
      });
    }
  }

  this.close = function() {
    server.close(function() {
      debug('Server shutdown.');
    });
  }
};

module.exports = Server;
