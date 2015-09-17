'use strict';

// Setting up route
angular.module('photos').config(['$stateProvider',
	function($stateProvider) {
		// Photos state routing
		$stateProvider.
		state('viewPhoto', {
      url: '/photo/:photoId',
			templateUrl: 'modules/photos/views/view-photo.client.view.html'
		}).
		state('viewEvent', {
      url: '/event/:eventId',
			templateUrl: 'modules/photos/views/view-event.client.view.html'
		});
	}
]);
