'use strict';

module.exports = {
  countdown: 5,
  frontend: {
    host: 'http://localhost:3000',
  },
  interface: {
    // This is an OSX 64-bit universal binary.
    // TODO: Figure out a platform-specific config option.
    // path: './bin/pbInterface.app/Contents/MacOS/pbInterface'
    // TODO: Bundle the fonts properly so the stand-alone binary works.
    path: '../interface/bin/pbInterfaceDebug.app/Contents/MacOS/pbInterfaceDebug'
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
