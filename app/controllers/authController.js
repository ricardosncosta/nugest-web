'use strict';

// Auth controller
var authControllers = angular.module('authControllers', ['ngCookies']);
authControllers.controller('AuthCtrl', [
    'User', 'AuthManager', '$scope', '$http', '$httpParamSerializerJQLike', '$location', 'Flash',
    function(User, AuthManager, $scope, $http, $httpParamSerializerJQLike, $location, Flash) {
        // TO REMOVE: Sample data
        $scope.user = {
            email: 'testuser@email.com',
            password: 'testpassword',
            remember: true
        };

        $scope.signIn = function() {
            delete $http.defaults.headers.common.Authorization;
            User.signIn($httpParamSerializerJQLike($scope.user), function(response) {
                if (response.user !== undefined) {
                    // Signin user
                    AuthManager.handleSignIn(response.token, response.user, $scope.user.remember);

                    // Redirect
                    Flash.add('success', 'You are now logged in!');
                    $location.path("/");
                }
            }, function(response) {
                if (response.data.error !== undefined) {
                    Flash.add('danger', response.data.error);
                }
            });
        };

        $scope.signOut = function() {
            AuthManager.handleSignOut();
            Flash.add('success', 'You have signed out.');
            $location.path("/");
        };
    }
]);
