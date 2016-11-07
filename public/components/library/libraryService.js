angular.module('spotifyApp').service('libraryService', function($http, spotifyService, loginService){
  var token = loginService.getToken();

  this.getLibrary = function(){
    return $http({
      headers: {
          "Authorization": 'Bearer ' + token
      },
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/tracks'
    });
  };
});
