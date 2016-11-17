'use strict';

// User controller
var dishControllers = angular.module('dishControllers', []);
dishControllers.controller('dishCtrl',
    ['$scope', 'dish', '$httpParamSerializerJQLike', 'flash',
    function($scope, Dish, $httpParamSerializerJQLike, flash) {
        $scope.updateMode = false;

        // Get all dishes
        Dish.query({},
			function(response) {
				$scope.dishes = response;
            }, function(response) {
                response = response.data;
                if (response.error !== undefined) {
                    flash.add('danger', response.error);
                }
            }
        );

        // Add dish
        $scope.saveDish = function() {
            Dish.save($httpParamSerializerJQLike($scope.dish),
                function(response) {
                    $scope.dish = {};
                    $scope.dishes.unshift(response);
                    flash.add('success', 'Dish created.');
                }, function(response) {
                    if (response.data.error !== undefined) {
                        flash.add('danger', response.data.error);
                    }
                }
            );
        };

        // Set Update mode
        $scope.setUpdateMode = function(status, index) {
            if (status === true) {
                $scope.dish = $scope.dishes[index];
                $scope.updateMode = true;
            } else {
                $scope.dish = {};
                $scope.updateMode = false;
            }
        };

        // Update dish
        $scope.updateDish = function(index) {
            Dish.update({ id: $scope.dish.id }, $httpParamSerializerJQLike($scope.dish),
                function(response) {
                    $scope.setUpdateMode(false);
                    flash.add('success', 'Dish updated.');
                }, function(response) {
                    if (response.data.error !== undefined) {
                        flash.add('danger', response.data.error);
                    }
                }
            );
        };

        // Remove dish
        $scope.removeDish = function(index) {
            if (confirm('Remove "' +$scope.dishes[index].name+ '"?')) {
                Dish.remove({ id: $scope.dishes[index].id },
                    function(response) {
                        $scope.dishes.splice($scope.dishes.indexOf($scope.dishes[index]), 1);
                        flash.add('success', 'Dish removed.');
                    }, function(response) {
                        if (response.data.error !== undefined) {
                            flash.add('danger', response.data.error);
                        }
                    }
                );
            }
        };

    }
]);
