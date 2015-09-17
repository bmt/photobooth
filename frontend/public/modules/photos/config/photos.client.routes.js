'use strict';

// Setting up route
angular.module('photos').config(['$stateProvider',
	function($stateProvider) {
		// Photos state routing
		$stateProvider.
		state('viewPhoto', {
			url: '/photo',
			templateUrl: 'modules/photos/views/view-photo.client.view.html'
		}).
		state('viewEvent', {
			url: '/event',
			templateUrl: 'modules/photos/views/view-event.client.view.html'
		});
	}
]);
