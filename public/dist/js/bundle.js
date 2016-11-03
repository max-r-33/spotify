'use strict';

angular.module('spotifyApp', ['ngCookies', 'ui.router']).config(function ($stateProvider, $urlRouterProvider) {

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
    });
    $urlRouterProvider.otherwise('/');
}).config(['$cookiesProvider', function ($cookiesProvider) {
    //makes token accessible for the whole app
    $cookiesProvider.defaults.path = '/';
}]);
'use strict';

angular.module('spotifyApp').controller('authController', function ($scope, loginService, $cookies) {

    //method to extract token from redirect url
    $scope.getToken = function () {
        var url = window.location.hash.substr(1);
        var elems = url.split('=');
        console.log(elems);
        console.log(elems[1].split('&'));
        $scope.token = elems[1];
    };

    //gets token from url
    $scope.getToken();

    //sets token
    loginService.setToken($scope.token);

    //redirects home after 1s
    setTimeout(function () {
        window.location = 'http://localhost:8080/#/search';
    }, 1000);
});
'use strict';

angular.module('spotifyApp').controller('loginController', function ($scope, loginService) {
    var redirect_uri = 'http://localhost:8080/components/login/afterAuth.html';
    //redirects to spotify permission request
    $scope.authorize = function () {
        loginService.authorize().then(function (resp) {
            window.location = "https://accounts.spotify.com/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=user-library-modify%20user-top-read%20user-library-read&response_type=token";
        });
    };
    loginService.getToken();
    $scope.isLoggedIn = loginService.isLoggedIn;
    if ($scope.isLoggedIn) {
        window.location = "http://localhost:8080/#/recommendations";
    }
});
'use strict';

var client_id = '9307698323d44b158135c48936a25dbf';
var redirect_uri = encodeURIComponent('http://localhost:8080/components/login/afterAuth.html');

angular.module('spotifyApp').service('loginService', function ($cookies, $http) {
    this.isLoggedIn = false;
    //requests auth token from spotify
    this.authorize = function () {
        return $http({
            method: 'GET',
            url: "https://accounts.spotify.com/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=user-library-modify%20user-top-read%20user-library-read&response_type=token"
        });
    };

    //save token to a cookie that expires in 1hr
    this.setToken = function (token) {
        var now = new Date();
        var time = now.getTime();
        time += 3600 * 1000;
        now.setTime(time);
        $cookies.put('token', token, { 'expires': now });
        console.log(token);
        this.token = token;
        this.isLoggedIn = true;
    };

    //gets token from a cookie
    this.getToken = function () {
        var token = $cookies.get('token');
        console.log(token);
        if (token) {
            this.isLoggedIn = true;
        } else {
            this.isLoggedIn = false;
        }
        return token;
    };
});
"use strict";
'use strict';

//filter to make iframes work with dynamic urls (for the spotify web player)
angular.module('spotifyApp').filter('trustAsResourceUrl', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);
'use strict';

var client_id = '9307698323d44b158135c48936a25dbf';
var redirect_uri = encodeURIComponent('http://localhost:8080/afterAuth.html');

angular.module('spotifyApp').controller('recommendationController', function ($scope, spotifyService, loginService) {

    //gets token from saved coookie
    $scope.getToken = function () {
        $scope.token = loginService.getToken();

        //redirects if user not logged in
        if (!$scope.token) {
            window.location = '/';
        }
    };

    //gets saved token when page is loaded
    $scope.getToken();

    //gets recommendations based on seeds
    $scope.getRecommendations = function () {
        spotifyService.getRecs($scope.artistName, $scope.songName, $scope.genreName).then(function (recs) {
            console.log(recs);
            $scope.recommendations = recs.data;
        });
    };

    //saves song to user's library
    $scope.saveSong = function (id) {
        spotifyService.saveTrack(id).then(function (res) {
            console.log(res);
        });
    };

    //removes song from user's library
    $scope.removeSong = function (id) {
        spotifyService.removeTrack(id).then(function (res) {
            console.log(res);
        });
    };
});
'use strict';

var client_id = '9307698323d44b158135c48936a25dbf';
var redirect_uri = encodeURIComponent('http://localhost:8080/afterAuth.html');

angular.module('spotifyApp').service('spotifyService', function ($http, $q, $cookies, loginService) {
    //looks up ids of provided elements and
    //gets recommendations accordingly
    var token;
    this.getRecs = function (artist, song, genre) {
        token = loginService.getToken();
        console.log(artist + " " + song + " " + genre);
        var songInfo;
        var artistInfo;
        var deferred = $q.defer();

        //gets track ID and info
        search(song, "track").then(function (songRes) {
            songInfo = songRes;
            //gets artist ID and info
            search(artist, "artist").then(function (artistRes) {
                artistInfo = artistRes;
                //gets recommendations
                $http({
                    headers: {
                        "Authorization": 'Bearer ' + token
                    },
                    method: 'GET',
                    url: 'https://api.spotify.com/v1/recommendations?seed_tracks=' + songInfo.id + '&seed_artists=' + artistInfo.id + '&seed_genres=' + genre
                }).then(function (response) {
                    var recommendationsWithInfo = {};
                    console.log(response);
                    //array of recommendations with info about each one
                    var recArray = [];
                    var recommendations = response.data.tracks;
                    recommendations.forEach(function (rec) {
                        var name = rec.name;
                        search(name, "track").then(function (info) {
                            recArray.push(info);
                        });
                    });
                    recommendationsWithInfo.data = recArray;
                    deferred.resolve(recommendationsWithInfo);
                });
            });
        });
        return deferred.promise;
    };

    //gets a provided song/artists id, name,
    //popularity and an assosciated image
    var search = function search(searchTerm, type) {
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'https://api.spotify.com/v1/search?q=' + encodeURI(searchTerm) + "&type=" + type
        }).then(function (result) {
            // console.log(result);

            var info = {
                id: result.data[type + 's'].items[0].id,
                uri: "https://embed.spotify.com/?uri=" + result.data[type + 's'].items[0].uri,
                popularity: result.data[type + 's'].items[0].popularity
            };
            if (result.data[type + 's'].items[0].name.length > 22) {
                info.name = shorten(result.data[type + 's'].items[0].name);
            } else {
                info.name = result.data[type + 's'].items[0].name;
            }
            if (type === 'artist') {
                info.image = result.data.artists.items[0].images[0].url;
            } else {
                info.albumImg = result.data.tracks.items[0].album.images[0].url;
                info.preview = result.data.tracks.items[0].preview_url;
                info.artistInfo = {
                    name: result.data.tracks.items[0].artists[0].name,
                    id: result.data.tracks.items[0].artists[0].id
                };
                getInfo(info.id).then(function (result) {
                    info.acoutsticness = result.acoutsticness;
                    info.danceability = result.danceability;
                    info.energy = result.energy;
                    info.instrumentalness = result.instrumentalness;
                    info.key = result.key;
                    info.tempo = result.tempo;
                }).then(function (result) {
                    checkIfAlreadySaved(info.id).then(function (result) {
                        info.alreadySaved = result;
                        console.log(info.alreadySaved);
                    });
                });
            }
            defer.resolve(info);
        });
        return defer.promise;
    };

    //gets detailed statistics about and individual song
    var getInfo = function getInfo(songID) {
        var defer = $q.defer();
        $http({
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            method: 'GET',
            url: 'https://api.spotify.com/v1/audio-features/' + songID
        }).then(function (res) {
            defer.resolve({
                acousticness: res.data.acousticness,
                danceability: res.data.danceability,
                energy: res.data.energy,
                instrumentalness: res.data.instrumentalness,
                key: res.data.key,
                tempo: res.data.tempo
            });
        });
        return defer.promise;
    };

    //saves track to your library
    this.saveTrack = function (id) {
        var defer = $q.defer();

        $http({
            headers: {
                'Authorization': 'Bearer ' + token
            },
            method: 'PUT',
            url: 'https://api.spotify.com/v1/me/tracks?ids=' + id
        }).then(function (result) {
            console.log(result.data);
        });
    };

    this.removeTrack = function (id) {
        $http({
            headers: {
                'Authorization': 'Bearer ' + token
            },
            method: 'DELETE',
            url: 'https://api.spotify.com/v1/me/tracks?ids=' + id
        }).then(function (result) {
            console.log(result.data);
        });
    };

    //checks if song is already saved to user's library
    var checkIfAlreadySaved = function checkIfAlreadySaved(id) {
        var defer = $q.defer();
        $http({
            headers: {
                'Authorization': 'Bearer ' + token
            },
            method: 'GET',
            url: 'https://api.spotify.com/v1/me/tracks/contains?ids=' + id
        }).then(function (result) {
            defer.resolve(result.data[0]);
        });
        return defer.promise;
    };

    //shortesn song titles that are too long
    var shorten = function shorten(str) {
        var arr = str.split("");
        var res = [];
        for (var i = 0; i < 22; i++) {
            res.push(arr[i]);
        }
        res.push('...');
        return res.join('');
    };
});
//# sourceMappingURL=bundle.js.map
