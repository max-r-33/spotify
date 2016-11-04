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
            //gets biggest square image
            for (var i = result.data.images.length - 1; i >= 0; i--) {
                if (result.data.images[i].height === result.data.images[i].width) {
                    artistInfo.image = result.data.images[i];
                }
            }
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
                    console.log(response);
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
                        artistInfo.albums = r.data.items;
                        //if there were no sqaure images from the artist
                        //profile, it sets the artists most recent album as
                        //it's profile photo.
                        if (!artistInfo.image) {
                            artistInfo.image = r.data.items[0].images[0];
                        }
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

    //unfollows artist with given id
    this.unfollowArtist = function(id) {
        var artistID = id;
        console.log(`artistID ${artistID}`);
        $http({
            headers: {
                "Authorization": 'Bearer ' + token
            },
            method: 'DELETE',
            url: 'https://api.spotify.com/v1/me/following?type=artist&ids=' + artistID
        }).then(function(res) {
            console.log(res);
        });
    };

});
