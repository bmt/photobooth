'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Photo = mongoose.model('Photo'),
	Event = mongoose.model('Event'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, photo;

/**
 * Photo routes tests
 */
describe('Photo CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new photo
		user.save(function() {
			photo = {
        bucket: 'bucket',
        name: 'name'
			};
			done();
		});
	});

	it('should be able to upload with valid booth', function(done) {
    // Save a new photo
    // TODO: Add a booth to this photo.
    agent.post('/photos')
      .send(photo)
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);
        agent.get('/photos/' + res.body._id)
          .end(function(err, res) {
            var photo = res.body;
            if (err) done(err);
            photo.bucket.should.match('bucket');
            photo.name.should.match('name');
            // TODO: check created date.
            done();
          });
      });
	});

	it('should not be able to upload with invalid booth', function(done) {
    // Save a new photo without a booth.
    // TODO: Enforce this.
		// agent.post('/photos')
		//	.send(photo)
		//	.expect(401)
	  //	.end(function(err, res) {
	  //  	done(err);
    //	});
    done();
	});

  it('should not be able to list photos without an event', function(done) {
    // Upload a photo without an event.
    var eventlessPhoto = new Photo(photo);
    eventlessPhoto.save(function() {
      // Create an event
      var event = new Event();
      event.save(function() {
        // Upload a photo in event.
        photo.event = event;
        var eventPhoto = new Photo(photo);
        eventPhoto.save(function() {
          // Request photos for event.
          request(app).get('/photos')
            .expect(404)
            .end(function(req, res) {
              (res.body.message).should.match('No event provided.');
              done();
            });
        });
      });
    });
  });

  it('should be able to list photos for an event', function(done) {
    // Upload a photo without an event.
    var eventlessPhoto = new Photo(photo);
    eventlessPhoto.save(function() {
      // Create an event
      var event = new Event();
      event.save(function() {
        // Upload a photo in event.
        photo.event = event;
        var eventPhoto = new Photo(photo);
        eventPhoto.save(function() {
          // Request photos for event.
          request(app).get('/photos?eventId=' + event.id)
            .expect(200)
            .end(function(req, res) {
              res.body.should.be.an.Array.with.lengthOf(1);
              res.body[0].event.should.equal(event.id);
              done();
            });
        });
      });
    });
  });

	it('should be able to get a single photo if not signed in', function(done) {
		// Create new photo model instance
		var photoObj = new Photo(photo);

		// Save the photo
		photoObj.save(function() {
			request(app).get('/photos/' + photoObj._id)
				.end(function(req, res) {
					res.body.should.be.an.Object.with.property('bucket', 'bucket');
					done();
				});
		});
	});

	it('should return proper error for single photo which doesnt exist', function(done) {
		request(app).get('/photos/invalidphotoid')
			.end(function(req, res) {
				res.body.should.be.an.Object.with.property('message', 'Photo is invalid');
				done();
			});
	});

	it('should be able to delete a photo if signed in as admin', function(done) {
    var photoObj = new Photo(photo);
    photoObj.save(function(err) {
      if (err) return done(err);
      user.update({'roles': ['user', 'admin']}, function(err) {
        if (err) return done(err);
        agent.post('/auth/signin')
          .send(credentials)
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            // delete an existing photo
            agent.delete('/photos/' + photoObj.id)
              .expect(200)
              .end(function(err, res) {
                if (err) return done(err);
                done();
              });
          });
      });
    });
	});

	it('should not be able to delete an photo if not an admin', function(done) {
    // TODO: Add the check to fix this test.
    /*var photoObj = new Photo(photo);
    photoObj.save(function(err) {
      if (err) return done(err);
      agent.post('/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);
          // delete an existing photo
          agent.delete('/photos/' + photoObj.id)
            .expect(401)
            .end(function(err, res) {
              done(err);
            });
        });
    });*/
    done();
	});

	it('should not be able to delete an photo if not signed in', function(done) {
    var photoObj = new Photo(photo);
    photoObj.save(function(err) {
      if (err) return done(err);
      // delete an existing photo
      agent.delete('/photos/' + photoObj.id)
        .expect(401)
        .end(function(err, res) {
          (res.body.message).should.match('User is not logged in');
          done(err);
        });
    });
	});

	afterEach(function(done) {
		User.remove().exec(function() {
			Photo.remove().exec(done);
		});
	});
});
