'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Photo = mongoose.model('Photo'),
	_ = require('lodash');

/**
 * Get the current photo.
 */
exports.get = function(req, res) {
	res.json(req.photo);
};

/**
 * Delete a Photo
 */
exports.delete = function(req, res) {
	var photo = req.photo;

	photo.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(photo);
		}
	});
};

/**
 * Create a photo entry.
 */
exports.create = function(req, res) {
	var photo = new Photo(req.body);
	photo.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(photo);
		}
	});
};

/**
 * Photos from a specific event
 */
exports.fromEvent = function(req, res) {
  Photo.find({event: req.params.eventId}).sort('-created').exec(
      function(err, photos) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(photos);
        }
      });
};

/**
 * Photo middleware
 */
exports.canUpload = function(req, res, next) {
  // TODO: Make sure it is a valid client token.
  next();
};

exports.canDelete = function(req, res, next) {
  // Already checked that user is logged in.
  // TODO: Verify that the user is an admin.
  next();
};

exports.photoById = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Photo is invalid'
		});
	}

	Photo.findById(id).exec(function(err, photo) {
		if (err) return next(err);
		if (!photo) {
			return res.status(404).send({
				message: 'Photo not found'
			});
		}
		req.photo = photo;
		next();
	});
};
