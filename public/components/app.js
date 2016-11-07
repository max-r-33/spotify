angular.module('spotifyApp', ['ngCookies', 'ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {

        //search state
        $stateProvider.state('recommendations', {
                url: '/recommendations',
                templateUrl: '/components/recommendations/recommendTmpl.html',
                controller: 'recommendationController'
            })
            //login state
            .state('login', {
                url: '/',
                templateUrl: '/components/login/login.html',
                controller: 'loginController'
            })

            .state('artist', {
                url:'/artist/:id',
                templateUrl: '/components/artist/artistTmpl.html',
                controller: 'artistController'
            })

            .state('album', {
                url:'/album/:id',
                templateUrl: '/components/album/albumTmpl.html',
                controller:'albumController'
            })

            .state('search', {
                url:'/search',
                templateUrl: '/components/search/searchTmpl.html',
                controller: 'searchController'
            })

            .state('library', {
                url:'/library',
                templateUrl:'/components/library/libraryTmpl.html',
                controller:'libraryController'
            });

        $urlRouterProvider.otherwise('/');

    }).config(['$cookiesProvider', function($cookiesProvider) {
        //makes token accessible for the whole app
        $cookiesProvider.defaults.path = '/';
    }]);
