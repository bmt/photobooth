'use strict';

// Photos service used for communicating with the photos REST endpoints
angular.module('photos').factory('Events', ['$resource',
	function($resource) {
		return $resource('events/:eventId', {
			eventId: '@_id'
		});
	}
]);
