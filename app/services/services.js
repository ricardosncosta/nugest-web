'use strict';
var services = angular.module('services', ['ngResource']);
var baseUrl = 'http://0.0.0.0:8000/api/0.1';

// Users
services.factory('User', ['$resource',
	function($resource) {
		return $resource(baseUrl+'/users/', {}, {
			signIn: { method:'POST', url: baseUrl+'/auth/signin' },
			restore: { method:'POST', url: baseUrl+'/auth/restore' },
		});
	}
]);

// Dish
services.factory('Dish', ['$resource', '$rootScope',
	function($resource, $rootScope) {
		return $resource(baseUrl+'/users/:username/dishes/:id',
							{ username: $rootScope.user.username, id: "@id" },
							{ update: { method: 'PUT' } }
						);
	}
]);

// Auth manager
services.factory('AuthManager', ['$rootScope', '$window', '$http', 'Flash', 'User', '$cookies', '$location', '$httpParamSerializerJQLike',
	function($rootScope, $window, $http, Flash, User, $cookies, $location, $httpParamSerializerJQLike) {
		var dataFactory = {}, timeOut;

		// Handle signed in user
        dataFactory.handleSignIn = function(token, user) {
			// Sets User and Token Authorization header
			$rootScope.user = user;
			$http.defaults.headers.common.Authorization = 'Bearer ' + token;

			// Sets Token as Cookie
			var deToken = this.decode64base(token, 1);
			var expiryDate = new Date(deToken.exp * 1000);
			$cookies.putObject('access_token', token, {expires: expiryDate});
        };

		// Handle signed out user
        dataFactory.handleSignOut = function() {
			// Unset user, Authorization header and cookie
            $rootScope.user = null;
			delete $http.defaults.headers.common.Authorization;
			$cookies.remove('access_token');

			// Redirect user back to landing page
			$location.path("/");
        };

		dataFactory.checkAuthentication = function() {
			var $this = this;
			var token = $cookies.getObject('access_token');
			if (token !== undefined) {
				User.restore($httpParamSerializerJQLike({token: token}),
					function(response) {
						$this.handleSignIn(response.token, response.user);
					}, function(response) {
		            	if (response.data.error !== undefined) {
							Flash.add('error', response.data.error);
		            	}
		            }
				);
			}
		};

		dataFactory.decode64base = function(token, dataIndex) {
			var strObj = '';
			if (dataIndex === undefined) {
				var splitToken = token.split('.');
				for (var i in splitToken) {
					strObj += splitToken[i].replace('-', '+').replace('_', '/');
				}
			} else {
				strObj = token.split('.')[dataIndex];
				strObj = strObj.replace('-', '+').replace('_', '/');
			}

			return JSON.parse($window.atob(strObj));
		};

        return dataFactory;
    }
]);

services.factory('AuthInterceptor', ['$q', 'Flash', '$location',
	function($q, Flash, $location) {
	    var service = this;
	    service.responseError = function(response) {
	        if (response.status == 401 && response.data.indexOf('Unauthorized') > -1) {
				// Save current url and redirect to signin page
				sessionStorage.nextUrl = $location.url();
				Flash.add('warning', 'Session expired. Please signin to continue.');
	            $location.path('/signin');
	        }

	        return $q.reject(response);
	    };

		return service;
	}
])

// Flash messages
services.factory('Flash', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
        var dataFactory = {}, timeOut;

        // Create flash message
        dataFactory.add = function(type, text) {
            if (Array.isArray(text)) {
                for (var msg in text) {
					$rootScope.flash.messages.push({type: type, text: text[msg]});
                }
            } else {
				$rootScope.flash.messages.push({type: type, text: text});
            }

			var $this = this;
			$timeout.cancel(timeOut);
            $timeout(function() {
                $rootScope.hasMsg = true;
            }, 100);
            timeOut = $timeout(function() {
                $this.clear();
            }, $rootScope.flash.timeout);
        };

        // Cancel flashmessage timeout function
        dataFactory.pause = function() {
            $timeout.cancel(timeOut);
        };

        // Clear flash messages
        dataFactory.clear = function() {
            $timeout.cancel(timeOut);
            $timeout(function() {
                $rootScope.flash.messages = [];
            });
        };
        return dataFactory;
    }
]);
