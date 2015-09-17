'use strict';

// Photos controller
angular.module('photos').controller('PhotosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Photos',
	function($scope, $stateParams, $location, Authentication, Photos) {
		$scope.authentication = Authentication;

		// Find a list of photos for an event
		$scope.find = function() {
			$scope.photos = Photos.query({'eventId': $stateParams.eventId || ''});
		};

		// Find existing photo
		$scope.findOne = function() {
			$scope.photo = Photos.get({
				photoId: $stateParams.photoId
			});
		};
	}
]);
