angular.module('spotifyApp', ['ngCookies', 'ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {

        //search state
        $stateProvider.state('recommendations', {
                url: '/recommendations',
                templateUrl: 'https://max-r-33.github.io/spotify/public/components/recommendations/recommendTmpl.html',
                controller: 'recommendationController'
            })

            //login state
            .state('login', {
                url: '/',
                templateUrl: 'https://max-r-33.github.io/spotify/public/components/public/components/login/login.html',
                controller: 'loginController'
            })

            //artist pages
            .state('artist', {
                url:'/artist/:id',
                templateUrl: 'https://max-r-33.github.io/spotify/public/components/public/components/artist/artistTmpl.html',
                controller: 'artistController'
            })

            //album pages
            .state('album', {
                url:'/album/:id',
                templateUrl: 'https://max-r-33.github.io/spotify/public/components/public/components/album/albumTmpl.html',
                controller:'albumController'
            })

            //search page
            .state('search', {
                url:'/search',
                templateUrl: 'https://max-r-33.github.io/spotify/public/components/public/components/search/searchTmpl.html',
                controller: 'searchController'
            })

            //library page
            .state('library', {
                url:'/library',
                templateUrl:'https://max-r-33.github.io/spotify/public/components/public/components/library/libraryTmpl.html',
                controller:'libraryController'
            });

        $urlRouterProvider.otherwise('/');

    }).config(['$cookiesProvider', function($cookiesProvider) {
        //makes token accessible for the whole app
        $cookiesProvider.defaults.path = '/';
    }]);
