'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	photos = require('../../app/controllers/photos.server.controller');

module.exports = function(app) {
	app.route('/photos')
    .get(photos.list)
		.post(photos.canUpload, photos.create);

  app.route('/photos/:photoId')
    .get(photos.get)
    .delete(users.requiresLogin, photos.canDelete, photos.delete);

  app.route('/:photoId')
    .get(function(req, res) {
      res.redirect('/#!/photo/' + req.params.photoId);
    });

	// Finish by binding the photo middleware
	app.param('photoId', photos.photoById);
};
