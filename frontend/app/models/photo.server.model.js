'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
  shortid = require('shortid');

var PhotoSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortid.generate
  },
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
  thumb: new Schema({
    bucket: {
      type: String,
    },
    name: {
      type: String,
    }
  }),
});

mongoose.model('Photo', PhotoSchema);
