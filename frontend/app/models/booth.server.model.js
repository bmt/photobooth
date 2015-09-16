'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var BoothSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
  description: {
    type: String,
    default: '',
    required: true,
    trim: true
  }
});

mongoose.model('Booth', BoothSchema);
