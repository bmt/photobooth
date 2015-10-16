'use strict';

// Photos controller
angular.module('photos').controller('PhotosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Photos', 'Events',
	function($scope, $stateParams, $location, Authentication, Photos, Events) {
		$scope.authentication = Authentication;

		// Find a list of photos for an event
		$scope.find = function() {
			$scope.photos = Photos.query({'eventId': $stateParams.eventId || ''});
      $scope.event = Events.get({eventId: $stateParams.eventId});
		};

		// Find existing photo
		$scope.findOne = function() {
      Photos.get({photoId: $stateParams.photoId}, function(photo) {
        $scope.photo = photo;
      });
		};
	}
]);
