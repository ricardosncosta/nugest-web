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

// Auth manager
services.factory('AuthManager', ['$rootScope', '$http', 'User', '$window', '$cookies', '$location', '$httpParamSerializerJQLike',
    function($rootScope, $http, User, $window, $cookies, $location, $httpParamSerializerJQLike) {
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
						$location.path("/");
					}, function(response) {
		            	var data = response.data;
		            	if (data.error !== undefined && Array.isArray(data.error)) {
		                	for (var msg in data.error) {
		                    	console.log(data.error[msg]);
		                	}
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

// Flash messages
services.factory('Flash', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
        var dataFactory = {}, timeOut;

        // Create flash message
        dataFactory.add = function(type, text) {
            var $this = this;
            $rootScope.flash.messages.push({type: type, text: text});
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
