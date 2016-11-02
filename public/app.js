angular.module('spotifyApp', ['ngCookies', 'ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {

        //search state
        $stateProvider.state('search', {
                url: '/search',
                templateUrl: '/components/search/searchTmpl.html',
                controller: 'searchController'
            })
            //login state
            .state('login', {
                url: '/',
                templateUrl: '/components/login/login.html',
                controller: 'loginController'
        });
        $urlRouterProvider.otherwise('/');

    }).config(['$cookiesProvider', function($cookiesProvider) {
        //makes token accessible for the whole app
        $cookiesProvider.defaults.path = '/';
    }]);
