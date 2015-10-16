'use strict';

var init = require('../config/init')(),
    config = require('../config/config'),
    request = require('request-promise'),
    process = require('process');

console.info('Creating block party event.');
request.post(config.frontend.host + '/events')
  .form({name: 'Fall Block Party'})
  .then(JSON.parse)
  .then(function(ev) {
    console.info('Update config/env/' + config.env + '.js with the following line to configure the event.');
    console.info('  eventId: \'' + ev._id + '\',');
    if (config.env === 'production') {
      console.info('Update frontend with heroku:');
      console.info('  heroku --app piphoto config:set BLOCK_PARTY_EVENT="' + ev._id + '"');
    } else {
      console.info('Update env and restart frontend:');
      console.info('  export BLOCK_PARTY_EVENT="' + ev._id + '"');
    }
  }).catch(function(err) {
    console.trace(err);
    console.error('Unable to create event.');
    exit(1);
  });
