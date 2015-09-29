'use strict';

module.exports = {
  // Override config for local to avoid excessive wait.
  countdown: {
    initial: 5,
    others: 10
  },
  // Uncomment to run with a locally built copy.
  // interface: {
  //   path: '../interface/bin/pbInterfaceDebug.app/Contents/MacOS/pbInterfaceDebug'
  // },
};
