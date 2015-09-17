'use strict';

// Photos service used for communicating with the photos REST endpoints
angular.module('photos').factory('Photos', ['$resource',
	function($resource) {
		return $resource('photos/:photoId', {
			photoId: '@_id'
		});
	}
]);
