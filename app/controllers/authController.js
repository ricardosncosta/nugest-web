'use strict';

// Auth controller
var authControllers = angular.module('authControllers', ['ngCookies']);
authControllers.controller('authCtrl', [
    'user', 'authManager', '$scope', '$http', '$httpParamSerializerJQLike', '$location', 'flash',
    function(user, authManager, $scope, $http, $httpParamSerializerJQLike, $location, flash) {
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
                    if (sessionStorage.nextUrl !== undefined) {
                        $location.path(sessionStorage.nextUrl);
                        sessionStorage.nextUrl = null;
                    } else {
                        $location.path("/");
                    }

        			// Flash message
                    flash.add('success', 'You are now signed in!');
                }
            }, function(response) {
                if (response.data.error !== undefined) {
                    flash.add('danger', response.data.error);
                }
            });
        };
    }
]);
