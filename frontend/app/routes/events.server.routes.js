'use strict';

/**
 * Module dependencies.
 */
var events = require('../../app/controllers/events.server.controller');
var config = require('../../config/config');

module.exports = function(app) {
	app.route('/events')
		.post(events.create);

  app.route('/events/:eventId')
    .get(events.get)

  app.route('/blockparty')
    .get(function(req, res) {
      if (config.blockPartyEvent) {
        res.redirect('/#!/event/' + config.blockPartyEvent);
      } else {
        res.status(404).send(
          {message: 'No event configured for block party.'});
      }
    });

	// Finish by binding the event lookup middleware
	app.param('eventId', events.eventById);
};
