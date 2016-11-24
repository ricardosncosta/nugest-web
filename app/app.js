'use strict';

// Declare app level module
var app = angular.module('nugestApp', [
    // Modules
    'ngRoute',
    'ngMessages',
    'ngAnimate',

    // Controllers
    'authControllers',
    'userControllers',
    'dishControllers',

    // Services
    'services',
]);

// Configuration
app.config(['$httpProvider', function($httpProvider) {
    // Set x-www-form-urlencoded as default content type for POST/PUT requests
    $httpProvider.defaults.headers.post = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    $httpProvider.defaults.headers.put = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    // Enable cross origin requests
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // HTTP interceptor
    $httpProvider.interceptors.push('authInterceptor');
}]);

// Routing
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/home.html',
        }).
        when('/signup', {
            templateUrl: 'views/user/signup.html',
            controller: 'userCtrl'
        }).
        when('/dishes', {
            templateUrl: 'views/dishes.html',
            controller: 'dishCtrl'
        }).
        otherwise({
            redirectTo: '/',
        });
    }
]);

app.run(function($rootScope, authManager, flash, $location) {
    // Set defaults
    $rootScope.curYear = new Date().getFullYear();
    $rootScope.flash = {
        timeout: 10000,
        messages: []
    };

    // Recover user session
    authManager.restoreSession();

    // Set route
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        if ($rootScope.user === undefined) {
            // If guest, redirect to /login
            if (next.templateUrl === "views/auth/signin.html" ||
                next.templateUrl === "views/user/signup.html" ||
                next.templateUrl === "views/home.html" ) {
            } else {
                $location.path("/");
            }
        }
    });
});
