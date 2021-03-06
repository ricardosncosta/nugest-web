'use strict';
var services = angular.module('services', ['ngResource']);
var baseUrl = 'http://0.0.0.0:8000/api/0.1';

// Users
services.factory('user', ['$resource',
	function($resource) {
		return $resource(baseUrl+'/users/', {}, {
			signIn: { method:'POST', url: baseUrl+'/auth/signin' },
			restore: { method:'POST', url: baseUrl+'/auth/restore' },
		});
	}
]);

// Dish
services.factory('dish', ['$resource', '$rootScope',
	function($resource, $rootScope) {
		return $resource(baseUrl+'/users/:username/dishes/:id',
							{ username: $rootScope.user.username, id: "@id" },
							{ update: { method: 'PUT' } }
						);
	}
]);

// Auth manager
services.factory('authManager', ['$rootScope', '$http', 'user', '$cookies', 'flash', '$window', '$httpParamSerializerJQLike',
	function($rootScope, $http, user, $cookies, flash, $window, $httpParamSerializerJQLike) {
		var $this = this, timeOut;

		// Handle signed in user
        $this.handleSignIn = function(token, user) {
			// Set User and Token Authorization header
			$rootScope.user = user;
			$http.defaults.headers.common.Authorization = 'Bearer ' + token;

			// Set Token as Cookie
			var deToken = $this.decode64base(token, 1);
			var expiryDate = new Date(deToken.exp * 1000);
			$cookies.putObject('access_token', token, {expires: expiryDate});

			// Close modal dialog
			$('#modalSignIn').modal('hide');
        };

		// Handle signed out user
        $this.handleSignOut = function() {
			// Delete user, Authorization header and access cookie
			delete $rootScope.user;
			delete $http.defaults.headers.common.Authorization;
			$cookies.remove('access_token');
        };

		$this.restoreSession = function() {
			var token = $cookies.getObject('access_token');
			if (token !== undefined) {
				user.restore($httpParamSerializerJQLike({token: token}),
					function(response) {
						$this.handleSignIn(response.token, response.user);
					}, function(response) {
		            	if (response.data.error !== undefined) {
							flash.add('error', response.data.error);
		            	}
		            }
				);
			}
		};

		$this.decode64base = function(token, dataIndex) {
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

        return $this;
    }
]);

// Http Interceptor
services.factory('authInterceptor', ['$q', 'flash', '$location', '$timeout', '$injector',
	function($q, flash, $location, $timeout, $injector) {
	    var $this = this;
	    $this.responseError = function(response) {
	        if (response.status == 401 && response.data.indexOf('Unauthorized') > -1) {
				// Save current url and redirect to signin page
				sessionStorage.lastUrl = $location.url();

				var auth = $injector.get('authManager');
				auth.handleSignOut();

				// Set message on authCtrl scope
				var authScope = angular.element("#modalSignIn").scope();
				authScope.addMessage('warning', 'Session expired. Please signin to continue.');

				// Show modal dialog
				$('#modalSignIn').modal('show');
	        }

	        return $q.reject(response);
	    };

		return $this;
	}
]);

// Flash messages
services.factory('flash', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
        var $this = {}, timeOut = [];

        // Create flash message
        $this.add = function(type, text) {
            if (Array.isArray(text)) {
                for (var msg in text) {
					$rootScope.flash.messages.push({type: type, text: text[msg]});
                }
            } else {
				$rootScope.flash.messages.push({type: type, text: text});
            }

            timeOut.push($timeout(
				function() { $rootScope.flash.messages.shift(); },
				$rootScope.flash.timeout)
			);
        };

        return $this;
    }
]);
