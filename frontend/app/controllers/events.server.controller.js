'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Event = mongoose.model('Event'),
	_ = require('lodash');

/**
 * Get the current photo.
 */
exports.get = function(req, res) {
	res.json(req.event);
};

/**
 * Create an event.
 */
exports.create = function(req, res) {
	var event = new Event(req.body);
	event.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(event);
		}
	});
};

// Populates the current event.
exports.eventById = function(req, res, next, id) {
	Event.findById(id).exec(function(err, event) {
		if (err) return next(err);
		if (!event) {
			return res.status(404).send({
				message: 'Event not found'
			});
		}
		req.event = event;
		next();
	});
};


