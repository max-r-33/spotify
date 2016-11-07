angular.module('spotifyApp').service('searchService', function($http, $q, spotifyService, loginService){
  var searchRes = {};
  var token = loginService.getToken();
  this.search = function(term){
    var defer = $q.defer();
    $http({
      method: 'GET',
      url:'https://api.spotify.com/v1/search?q=' + term + '&type=artist,album,track'
    }).then(function(result){
      searchRes.tracks = result.data.tracks;
      searchRes.albums = [];
      searchRes.artists = [];

      //checks that artist has a photo
      for(var i = 0; i < result.data.artists.items.length; i++){
        if(result.data.artists.items[i].images.length > 0){
          searchRes.artists.push(result.data.artists.items[i]);
        }
      }

      //checks artist name length
      for(var x = 0; x < searchRes.artists.length; x++){
        if(searchRes.artists[x].name.length > 20){
          searchRes.artists[x].name = spotifyService.shorten(searchRes.artists[x].name);
        }
      }

      //checks all albums have a photo
      for(var y = 0; y < result.data.albums.items.length; y++){
        if(result.data.albums.items[y].images.length > 0){
          searchRes.albums.push(result.data.albums.items[y]);
        }
      }

      //checks album name length
      for(var d = 0; d < searchRes.albums.length; d++){
        if(searchRes.albums[d].name.length > 18){
          searchRes.albums[d].name = spotifyService.shorten(searchRes.albums[d].name);
        }
      }

      //checks songs album name length
      for(var l = 0; l < searchRes.tracks.items.length; l++){
        if(searchRes.tracks.items[l].album.name.length > 18){
          searchRes.tracks.items[l].album.name = spotifyService.shorten(searchRes.tracks.items[l].album.name);
        }
      }

      //checks if song is saved
      for (var a = 0; a < searchRes.tracks.items.length; a++) {
          checkSong(searchRes.tracks.items[a].id, a);
      }

    });

    defer.resolve(searchRes);
    return defer.promise;
  };

  var checkSong = function(id, index) {
      $http({
          headers: {
              "Authorization": 'Bearer ' + token
          },
          method: 'GET',
          url: 'https://api.spotify.com/v1/me/tracks/contains?ids=' + id
      }).then(function(res){
          searchRes.tracks.items[index].alreadySaved = res.data[0];
      });
  };

});
