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
  name: {
    type: String,
    required: true,
  },
});

mongoose.model('Event', EventSchema);
