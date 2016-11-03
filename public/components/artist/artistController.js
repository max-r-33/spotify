angular.module('spotifyApp').controller('artistController', function($scope, $stateParams, artistService){
  $scope.artistId = $stateParams.id;

  //gets artist info
  artistService.getArtistInfo($scope.artistId).then(function(result){
      $scope.artistInfo = result;
      console.log(result);
  });

  console.log($scope.artistInfo);
});
