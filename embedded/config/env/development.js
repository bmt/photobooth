'use strict';

var os = require('os');

var interfacePaths = {
  linux: '../interface/bin/interface_debug',
  darwin: '../interface/bin/pbInterfaceDebug.app/Contents/MacOS/pbInterfaceDebug'
};

module.exports = {
  // Override config for local to avoid excessive wait.
  // countdown: 5,
  frontend: {
    host: 'http://localhost:3000'
  },
  interface: {
    path: interfacePaths[os.platform()],
    maxRestarts: 5
  },
};
