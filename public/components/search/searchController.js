angular.module('spotifyApp').controller('searchController', function($scope, searchService){
    $scope.search = function(term){
      searchService.search(term).then(function(result){
        console.log(result);
        $scope.albums = result.data.albums;
        $scope.artists = result.data.artists;
        $scope.tracks = result.data.tracks;
      });
    };
});
