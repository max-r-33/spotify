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
    }).state('artist', {
        url: '/artist/:id',
        templateUrl: '/components/artist/artistTmpl.html',
        controller: 'artistController'
    }).state('album', {
        url: '/album/:id',
        templateUrl: '/components/album/albumTmpl.html',
        controller: 'albumController'
    });

    $urlRouterProvider.otherwise('/');
}).config(['$cookiesProvider', function ($cookiesProvider) {
    //makes token accessible for the whole app
    $cookiesProvider.defaults.path = '/';
}]);
'use strict';

//filter to make iframes work with dynamic urls (for the spotify web player)
//and for some images
angular.module('spotifyApp').filter('trustAsResourceUrl', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);
'use strict';

angular.module('spotifyApp').controller('albumController', function ($scope, $stateParams, albumService, spotifyService) {
  $scope.albumId = $stateParams.id;
  $scope.getAlbum = function () {
    albumService.getAlbumInfo($scope.albumId).then(function (response) {
      $scope.albumInfo = response;
    });
  };

  $scope.saveSong = function (id) {
    spotifyService.saveTrack(id);
  };

  $scope.removeSong = function (id) {
    spotifyService.removeTrack(id);
  };

  $scope.saveAlbum = function (id) {
    spotifyService.saveAlbum(id);
  };

  $scope.removeAlbum = function (id) {
    spotifyService.removeAlbum(id);
  };
  $scope.getAlbum();
});
'use strict';

angular.module('spotifyApp').service('albumService', function ($http, $q, loginService) {
  var token = loginService.getToken();
  var albumInfo = {};

  this.getAlbumInfo = function (id) {
    //gets basic album info
    var defer = $q.defer();

    $http({
      headers: {
        "Authorization": 'Bearer ' + token
      },
      method: 'GET',
      url: 'https://api.spotify.com/v1/albums/' + id
    }).then(function (res) {
      albumInfo.artist = res.data.artists[0];
      albumInfo.image = res.data.images[0].url;
      albumInfo.name = res.data.name;
      albumInfo.releaseDate = res.data.release_date;
      albumInfo.tracks = res.data.tracks.items;
    }).then(function () {
      //checks if album has been saved
      $http({
        headers: {
          "Authorization": 'Bearer ' + token
        },
        method: 'GET',
        url: 'https://api.spotify.com/v1/me/albums/contains?ids=' + id
      }).then(function (result) {
        //checks if each song has been saved
        albumInfo.alreadySaved = result.data[0];
        for (var x = 0; x < albumInfo.tracks.length; x++) {
          checkIfTrackSaved(albumInfo.tracks[x].id, x);
        }
      });
    });
    defer.resolve(albumInfo);
    console.log(albumInfo);
    return defer.promise;
  };

  //checks if track with given id has ben saved
  var checkIfTrackSaved = function checkIfTrackSaved(id, index) {
    var track = id;
    $http({
      headers: {
        "Authorization": 'Bearer ' + token
      },
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/tracks/contains?ids=' + track
    }).then(function (result) {
      albumInfo.tracks[index].alreadySaved = result.data[0];
    });
  };
});
'use strict';

angular.module('spotifyApp').controller('artistController', function ($scope, $stateParams, artistService, spotifyService) {
    $scope.artistId = $stateParams.id;
    console.log($scope.artistId);
    //gets artist info
    artistService.getArtistInfo($scope.artistId).then(function (result) {
        $scope.artistInfo = result;
        console.log($scope.artistInfo);
    });

    //follows artist
    $scope.follow = function () {
        artistService.followArtist($scope.artistId);
    };

    //unfollows artist
    $scope.unfollow = function () {
        artistService.unfollowArtist($scope.artistId);
    };

    //saves song to user's library
    $scope.saveSong = function (id) {
        spotifyService.saveTrack(id);
    };

    //removes saved song from user's library
    $scope.removeSong = function (id) {
        spotifyService.removeTrack(id);
    };
});
'use strict';

angular.module('spotifyApp').service('artistService', function ($http, $q, loginService) {
    var token = loginService.getToken();
    var artistInfo = {};
    //gets artist info from spotify
    this.getArtistInfo = function (id) {
        //gets basic artist info
        artistInfo.image = undefined;
        var defer = $q.defer();
        var artistID = id;
        $http({
            headers: {
                "Authorization": 'Bearer ' + token
            },
            method: 'GET',
            url: 'https://api.spotify.com/v1/artists/' + id
        }).then(function (result) {
            artistInfo.genres = result.data.genres;
            artistInfo.popularity = result.data.popularity;
            artistInfo.name = result.data.name;
            //gets biggest square image
            for (var i = result.data.images.length - 1; i >= 0; i--) {
                if (result.data.images[i].height === result.data.images[i].width) {
                    artistInfo.image = result.data.images[i];
                }
            }
        }).then(function () {
            //gets if a user follows an artist
            $http({
                headers: {
                    "Authorization": 'Bearer ' + token
                },
                method: 'GET',
                url: 'https://api.spotify.com/v1/me/following/contains?type=artist&ids=' + artistID
            }).then(function (res) {
                artistInfo.alreadyFollowing = res.data[0];
            }).then(function () {
                //gets an artist's top tracks
                $http({
                    headers: {
                        "Authorization": 'Bearer ' + token
                    },
                    method: 'GET',
                    url: 'https://api.spotify.com/v1/artists/' + artistID + '/top-tracks?country=US'
                }).then(function (response) {
                    artistInfo.topTracks = response.data.tracks;
                    artistInfo.topTracks.forEach(function (track) {
                        //checks if a user already
                        checkIfSongSaved(track.id).then(function (result) {
                            track.alreadySaved = result.data[0];
                        });
                    });
                }).then(function () {
                    //gets an artist's albums
                    $http({
                        headers: {
                            "Authorization": 'Bearer ' + token
                        },
                        method: 'GET',
                        url: 'https://api.spotify.com/v1/artists/' + artistID + '/albums?country=US'
                    }).then(function (r) {
                        // console.log(r);
                        var albumArr = [];
                        //filters out singles and compilations
                        for (var i = 0; i < r.data.items.length; i++) {
                            if (r.data.items[i].album_type === 'album') {
                                albumArr.push(r.data.items[i]);
                            }
                        }
                        artistInfo.albums = albumArr;
                        console.log(artistInfo.albums);
                        //request to get all tracks from each album
                        for (var x = 0; x < artistInfo.albums.length; x++) {
                            getTracksOnAlbum(artistInfo.albums[x].id, x);
                        }

                        //if there were no sqaure images from the artist
                        //profile, it sets the artists most recent album as
                        //the profile photo.
                        if (!artistInfo.image) {
                            artistInfo.image = r.data.items[0].images[0];
                        }
                    });
                });
            });
        });
        defer.resolve(artistInfo);
        // console.log(artistInfo);
        return defer.promise;
    };

    //follows artist with given id
    this.followArtist = function (id) {
        var artistID = id;
        $http({
            headers: {
                "Authorization": 'Bearer ' + token
            },
            method: 'PUT',
            url: 'https://api.spotify.com/v1/me/following?type=artist&ids=' + artistID
        }).then(function (res) {
            console.log(res);
        });
    };

    //unfollows artist with given id
    this.unfollowArtist = function (id) {
        var artistID = id;
        // console.log(`artistID ${artistID}`);
        $http({
            headers: {
                "Authorization": 'Bearer ' + token
            },
            method: 'DELETE',
            url: 'https://api.spotify.com/v1/me/following?type=artist&ids=' + artistID
        }).then(function (res) {
            //console.log(res);
        });
    };

    //checks if a song is already saved to a user's library
    var checkIfSongSaved = function checkIfSongSaved(id) {
        var artistID = id;
        return $http({
            headers: {
                "Authorization": 'Bearer ' + token
            },
            method: 'GET',
            url: 'https://api.spotify.com/v1/me/tracks/contains?ids=' + artistID
        });
    };

    //gets tracks on album with given id, made it a separate
    //function to break scope
    var getTracksOnAlbum = function getTracksOnAlbum(id, index) {
        var artistID = id;
        $http({
            headers: {
                "Authorization": 'Bearer ' + token
            },
            method: 'GET',
            url: 'https://api.spotify.com/v1/albums/' + artistID
        }).then(function (trackList) {
            artistInfo.albums[index].tracks = trackList.data.tracks;
        });
    };
});
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
            window.location = "https://accounts.spotify.com/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=user-library-modify%20user-top-read%20user-library-read%20user-follow-modify%20user-follow-read&response_type=token";
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
            url: "https://accounts.spotify.com/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=user-library-modify%20user-top-read%20user-library-read%20user-follow-modify%20user-follow-read&response_type=token"
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
        spotifyService.saveTrack(id);
    };

    //removes song from user's library
    $scope.removeSong = function (id) {
        spotifyService.removeTrack(id);
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
            console.log(songRes);
            songInfo = songRes;
            //gets artist ID and info
            search(artist, "artist").then(function (artistRes) {
                console.log(artistRes);
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
                info.albumId = result.data.tracks.items[0].album.id;
                info.albumImg = result.data.tracks.items[0].album.images[0].url;
                info.preview = result.data.tracks.items[0].preview_url;
                info.artistInfo = {
                    name: result.data.tracks.items[0].artists[0].name,
                    id: result.data.tracks.items[0].artists[0].id
                };
                //get specific stats about each song.
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
        token = loginService.getToken();
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
        token = loginService.getToken();
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

    this.saveAlbum = function (id) {
        token = loginService.getToken();
        $http({
            headers: {
                'Authorization': 'Bearer ' + token
            },
            method: 'PUT',
            url: 'https://api.spotify.com/v1/me/albums?ids=' + id
        }).then(function (result) {
            console.log(result.data);
        });
    };

    this.removeAlbum = function (id) {
        token = loginService.getToken();
        $http({
            headers: {
                'Authorization': 'Bearer ' + token
            },
            method: 'DELETE',
            url: 'https://api.spotify.com/v1/me/albums?ids=' + id
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
