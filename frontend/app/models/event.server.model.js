'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var EventSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
  // TODO: Add event details.
});

mongoose.model('Event', EventSchema);
