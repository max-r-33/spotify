angular.module('spotifyApp').service('searchService', function($http){
  this.search = function(term){
    return $http({
      method: 'GET',
      url:'https://api.spotify.com/v1/search?q=' + term + '&type=artist,album,track'
    });
  };
});
