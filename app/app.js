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

    // Services
    'services',
]);

// Configuration
app.config(['$httpProvider', function($httpProvider) {
    // Set x-www-form-urlencoded as default content type for POST requests
    $httpProvider.defaults.headers.post = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    // Enable cross origin requests
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

// Routing
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/home.html',
        }).
        when('/signin', {
            templateUrl: 'views/auth/signin.html',
            controller: 'AuthCtrl'
        }).
        when('/signup', {
            templateUrl: 'views/user/signup.html',
            controller: 'UserCtrl'
        }).
        otherwise({
            redirectTo: '/',
        });
    }
]);

app.run(function($rootScope, AuthManager, Flash, $location) {
    // Set defaults
    $rootScope.curYear = new Date().getFullYear();
    $rootScope.flash = {
        timeout: 10000,
        messages: []
    };

    // Recover user session
    AuthManager.checkAuthentication();
    $rootScope.signOut = function() {
        AuthManager.handleSignOut();
        Flash.add('success', 'You have signed out.');
        $location.path("/");
    };

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
