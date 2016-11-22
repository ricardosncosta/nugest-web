'use strict';

// Auth controller
var authControllers = angular.module('authControllers', ['ngCookies']);
authControllers.controller('authCtrl', [
    '$scope', '$http', '$httpParamSerializerJQLike', '$location', '$timeout', 'user', 'authManager', 'flash',
    function($scope, $http, $httpParamSerializerJQLike, $location, $timeout, user, authManager, flash) {
        $scope.messages = [];

        // TO REMOVE: Sample data
        $scope.user = {
            email: 'testuser@email.com',
            password: 'testpassword',
            remember: true
        };

        $scope.signIn = function() {
            delete $http.defaults.headers.common.Authorization;
            user.signIn($httpParamSerializerJQLike($scope.user), function(response) {
                if (response.user !== undefined) {
                    // Signin user
                    authManager.handleSignIn(response.token, response.user, $scope.user.remember);

                    // Redirect
                    if (sessionStorage.lastUrl !== undefined) {
                        $location.path(sessionStorage.lastUrl);
                        delete sessionStorage.lastUrl;
                    }

        			// Flash message
                    flash.add('success', 'You are now signed in!');
                }
            }, function(response) {
                if (response.data.error !== undefined) {
                    $scope.addMessage('danger', response.data.error)
                }
            });
        };

        $scope.closeSignIn = function() {
            var url = $location.url();
            if (url != "/" && url != '/signup') {
                $location.path("/");
            }
        };

        $scope.signOut = function() {
            authManager.handleSignOut();
            $location.path("/");

    		// Flash message
        	flash.add('success', 'You have signed out.');
        };

        $scope.addMessage = function(type, msgs) {
            if (Array.isArray(msgs)) {
                for (var msg in msgs) {
    				$scope.messages.push({type: type, text: msgs[msg]});
                }
            } else {
                $scope.messages.push({type: type, text: msgs});
            }

            $timeout(function() { $scope.messages.shift(); }, 10000);
        };
    }
]);
