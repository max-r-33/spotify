angular.module('spotifyApp').service('artistService', function($http, $q, loginService) {
    var token = loginService.getToken();

    //gets artist info from spotify
    this.getArtistInfo = function(id) {
        //gets basic artist info
        var defer = $q.defer();
        var artistInfo = {};
        var artistID = id;
        $http({
            headers: {
                "Authorization": 'Bearer ' + token
            },
            method: 'GET',
            url: 'https://api.spotify.com/v1/artists/' + id
        }).then(function(result) {
            artistInfo.genres = result.data.genres;
            artistInfo.popularity = result.data.popularity;
            artistInfo.name = result.data.name;
            artistInfo.image = result.data.images[1];
        }).then(function() {
            //gets if a user follows an artist
            $http({
                headers: {
                    "Authorization": 'Bearer ' + token
                },
                method: 'GET',
                url: 'https://api.spotify.com/v1/me/following/contains?type=artist&ids=' + artistID
            }).then(function(res) {
                artistInfo.alreadyFollowing = res.data[0];
            }).then(function() {
                //gets an artist's top tracks
                $http({
                    headers: {
                        "Authorization": 'Bearer ' + token
                    },
                    method: 'GET',
                    url: 'https://api.spotify.com/v1/artists/' + artistID + '/top-tracks?country=US'
                }).then(function(response) {
                    artistInfo.topTracks = response.data.tracks;
                }).then(function() {
                    //gets an artist's albums
                    $http({
                        headers: {
                            "Authorization": 'Bearer ' + token
                        },
                        method: 'GET',
                        url: 'https://api.spotify.com/v1/artists/' + artistID + '/albums?country=US'
                    }).then(function(r) {
                        artistInfo.albums = arrayToObject(r.data.items);
                    });
                });
            });
        });
        defer.resolve(artistInfo);
        return defer.promise;
    };

    //follows artist with given id
    this.followArtist = function(id) {
        var artistID = id;
        $http({
            headers: {
                "Authorization": 'Bearer ' + token
            },
            method: 'PUT',
            url: 'https://api.spotify.com/v1/me/following?type=artist&ids=' + artistID
        }).then(function(res) {
            console.log(res);
        });
    };

    var arrayToObject = function(arr){
      var res = {};
      for(var i = 0; i < arr.length; i++){
        res[i] = arr[i];
      }
      return res;
    };

});
