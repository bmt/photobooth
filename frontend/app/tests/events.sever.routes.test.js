'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	Event = mongoose.model('Event'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, event;

/**
 * Event routes tests
 */
describe('Event CRUD tests', function() {
	beforeEach(function(done) {
    event = {name: 'New Event'};
    done();
	});

	it('should be able to create a new event.', function(done) {
    // Save a new event
    agent.post('/events')
      .send(event)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        agent.get('/events/' + res.body._id)
          .end(function(err, res) {
            var events = res.body;
            if (err) return done(err);
            event.name.should.match('New Event');
            // TODO: check created date.
            done();
          });
      });
	});

	afterEach(function(done) {
    Event.remove().exec(done);
	});
});