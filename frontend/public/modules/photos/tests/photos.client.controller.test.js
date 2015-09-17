'use strict';

(function() {
	// Photos Controller Spec
	describe('Photos Controller Tests', function() {
		// Initialize global variables
		var PhotosController,
			scope,
			$httpBackend,
			$stateParams,
			$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Photos controller.
			PhotosController = $controller('PhotosController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one photo object fetched from XHR', inject(function(Photos) {
			// Create sample photo.
			var samplePhoto = new Photos({
				bucketId: 'bucketid',
				eventId: 'eventid'
			});

			// Create a sample photos array that includes the new article
			var samplePhotos = [samplePhoto];

			// Set the URL parameter
			$stateParams.eventId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/photos\?eventId=([0-9a-fA-F]{24})$/).respond(samplePhotos);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.photos).toEqualData(samplePhotos);
		}));

		it('$scope.findOne() should create an array with one photo object fetched from XHR using a photoId URL parameter', inject(function(Photos) {
			// Define a sample photo object
			var samplePhoto = new Photos({
				bucketId: 'bucketid',
				eventId: 'eventid'
			});

			// Set the URL parameter
			$stateParams.photoId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/photos\/([0-9a-fA-F]{24})$/).respond(samplePhoto);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.photo).toEqualData(samplePhoto);
		}));
	});
}());
