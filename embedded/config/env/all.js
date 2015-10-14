'use strict';

var os = require('os');

var interfacePaths = {
  linux: '../interface/bin/interface_debug',
  darwin: '../interface/bin/pbInterfaceDebug.app/Contents/MacOS/pbInterfaceDebug'
};

var gphotoPaths = {
  linux: '/usr/bin/gphoto2',
  darwin: '/opt/local/bin/gphoto2',
};

module.exports = {
  countdown: 5,
  frontend: {
    host: 'http://piphoto.herokuapp.com'
  },
  gphoto: {
    path: gphotoPaths[os.platform()],
  },
  interface: {
    path: interfacePaths[os.platform()],
    maxRestarts: 5
  },
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: '/auth/google/callback',
    project: process.env.GOOGLE_PROJECT || 'APP_PROJECT',
    keyFilename: 'secrets/service/prod.json',
    storageBucket: process.env.GOOGLE_STORAGE_BUCKET || 'STORAGE_BUCKET',
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
