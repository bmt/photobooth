'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	photos = require('../../app/controllers/photos.server.controller');

module.exports = function(app) {
  app.route('/:photoId')
    .get(photos.get)
    .delete(users.requiresLogin, photos.canDelete, photos.delete);

	app.route('/photos')
		.post(photos.canUpload, photos.create);

	app.route('/photos/:eventId')
		.get(photos.fromEvent)

	// Finish by binding the photo middleware
	app.param('photoId', photos.photoById);
};
