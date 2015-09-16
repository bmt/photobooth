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
  bucketId: {
    type: String,
    required: true,
  },
  objectId: {
    type: String,
    required: true,
  },
  event: {
    type: Schema.ObjectId,
    ref: 'Event',
  },
});

mongoose.model('Photo', PhotoSchema);
