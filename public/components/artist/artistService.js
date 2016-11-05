angular.module('spotifyApp').service('artistService', function($http, $q, loginService) {
    var token = loginService.getToken();
    var artistInfo = {};
    //gets artist info from spotify
    this.getArtistInfo = function(id) {
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
                    artistInfo.topTracks.forEach(function(track){
                      //checks if a user already
                      checkIfSongSaved(track.id).then(function(result){
                        track.alreadySaved = result.data[0];
                      });
                    });
                }).then(function() {
                    //gets an artist's albums
                    $http({
                        headers: {
                            "Authorization": 'Bearer ' + token
                        },
                        method: 'GET',
                        url: 'https://api.spotify.com/v1/artists/' + artistID + '/albums?country=US'
                    }).then(function(r) {
                        // console.log(r);
                        var albumArr = [];
                        //filters out singles and compilations
                        for(var i = 0; i < r.data.items.length; i++){
                            if(r.data.items[i].album_type === 'album'){
                              albumArr.push(r.data.items[i]);
                            }
                        }
                        artistInfo.albums = albumArr;
                        console.log(artistInfo.albums);
                        //request to get all tracks from each album
                        for(var x = 0; x < artistInfo.albums.length; x++){
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
        // console.log(`artistID ${artistID}`);
        $http({
            headers: {
                "Authorization": 'Bearer ' + token
            },
            method: 'DELETE',
            url: 'https://api.spotify.com/v1/me/following?type=artist&ids=' + artistID
        }).then(function(res) {
            //console.log(res);
        });
    };

    //checks if a song is already saved to a user's library
    var checkIfSongSaved = function(id){
      var artistID = id;
      return $http({
        headers: {
            "Authorization": 'Bearer ' + token
        },
        method:'GET',
        url:'https://api.spotify.com/v1/me/tracks/contains?ids=' + artistID
      });
    };

    //gets tracks on album with given id, made it a separate
    //function to break scope
    var getTracksOnAlbum = function(id, index){
      var artistID = id;
      $http({
        headers: {
            "Authorization": 'Bearer ' + token
        },
        method:'GET',
        url:'https://api.spotify.com/v1/albums/' + artistID
      }).then(function(trackList){
        artistInfo.albums[index].tracks = trackList.data.tracks;
      });
    };

});
