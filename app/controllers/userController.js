'use strict';

// User controller
var userControllers = angular.module('userControllers', []);
userControllers.controller('UserCtrl', [
    '$scope', 'User', '$httpParamSerializerJQLike', '$location', 'Flash',
    function($scope, User, $httpParamSerializerJQLike, $location, Flash) {
        // TO REMOVE: Sample data
        $scope.user = {
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser2',
            email: 'testuser2@email.com',
            password: 'testpassword2',
            password_confirmation: 'testpassword2',
        };

        $scope.signUp = function() {
            User.save($httpParamSerializerJQLike($scope.user),
                function(response) {
                    Flash.add('success', 'User created successfully. Please check your email.');
                }, function(response) {
                    response = response.data;
                    if (response.error !== undefined) {
                        if (Array.isArray(response.error)) {
                            for (var msg in response.error) {
                                Flash.add('danger', response.error[msg]);
                            }
                        } else {
                            Flash.add('danger', response.error);
                        }
                    }
                }
            );
        };
    }
]);
