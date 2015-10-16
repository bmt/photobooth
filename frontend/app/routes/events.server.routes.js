'use strict';

/**
 * Module dependencies.
 */
var events = require('../../app/controllers/events.server.controller');

module.exports = function(app) {
	app.route('/events')
		.post(events.create);

  app.route('/blockparty')
    .get(function(req, res) {
      if (config.blockPartyEvent) {
        res.redirect('/#!/photos?eventId=' + config.blockPartyEvent);
      } else {
        res.status(404).send(
          {message: 'No event configured for block party.'});
      }
    });
};
