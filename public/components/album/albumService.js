angular.module('spotifyApp').service('albumService', function($http, $q ,loginService){
  var token = loginService.getToken();
  var albumInfo = {};

  this.getAlbumInfo = function(id){
    //gets basic album info
    var defer = $q.defer();

    $http({
      headers: {
          "Authorization": 'Bearer ' + token
      },
      method:'GET',
      url:'https://api.spotify.com/v1/albums/' + id
    }).then(function(res){
      albumInfo.artist = res.data.artists[0];
      albumInfo.image = res.data.images[0].url;
      albumInfo.name = res.data.name;
      albumInfo.releaseDate = res.data.release_date;
      albumInfo.tracks = res.data.tracks.items;
    }).then(function(){
      //checks if album has been saved
      $http({
        headers: {
            "Authorization": 'Bearer ' + token
        },
        method:'GET',
        url:'https://api.spotify.com/v1/me/albums/contains?ids='+id
      }).then(function(result){
        //checks if each song has been saved
        albumInfo.alreadySaved = result.data[0];
        for(var x = 0; x < albumInfo.tracks.length; x++){
          checkIfTrackSaved(albumInfo.tracks[x].id, x);
        }
      });
    });
    defer.resolve(albumInfo);
    console.log(albumInfo);
    return defer.promise;
  };

  //checks if track with given id has ben saved
  var checkIfTrackSaved = function(id, index){
    var track = id;
    $http({
      headers: {
          "Authorization": 'Bearer ' + token
      },
      method:'GET',
      url:'https://api.spotify.com/v1/me/tracks/contains?ids=' + track
    }).then(function(result){
      albumInfo.tracks[index].alreadySaved = result.data[0];
    });
  };
});
