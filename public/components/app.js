angular.module('spotifyApp', ['ngCookies', 'ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {

        //search state
        $stateProvider.state('recommendations', {
                url: '/recommendations',
                templateUrl: 'recommendations/recommendTmpl.html',
                controller: 'recommendationController'
            })

            //login state
            .state('login', {
                url: '/',
                templateUrl: 'login/login.html',
                controller: 'loginController'
            })

            //artist pages
            .state('artist', {
                url:'/artist/:id',
                templateUrl: 'artist/artistTmpl.html',
                controller: 'artistController'
            })

            //album pages
            .state('album', {
                url:'/album/:id',
                templateUrl: 'album/albumTmpl.html',
                controller:'albumController'
            })

            //search page
            .state('search', {
                url:'/search',
                templateUrl: 'search/searchTmpl.html',
                controller: 'searchController'
            })

            //library page
            .state('library', {
                url:'/library',
                templateUrl:'library/libraryTmpl.html',
                controller:'libraryController'
            });

        $urlRouterProvider.otherwise('/');

    }).config(['$cookiesProvider', function($cookiesProvider) {
        //makes token accessible for the whole app
        $cookiesProvider.defaults.path = '/';
    }]);
