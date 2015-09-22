'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PhotoSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
  bucket: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  event: {
    type: Schema.ObjectId,
    ref: 'Event',
  },
});

mongoose.model('Photo', PhotoSchema);
