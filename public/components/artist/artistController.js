angular.module('spotifyApp').controller('artistController', function($scope, $stateParams, artistService){
  $scope.artistId = $stateParams.id;

  //gets artist info
  artistService.getArtistInfo($scope.artistId).then(function(result){
      $scope.artistInfo = result;
      console.log(result);
  });

  //follows artist
  $scope.follow = function(id){
      console.log($scope.artistId);
      artistService.followArtist($scope.artistId);
  };


  //unfollows artist
  $scope.unfollow = function(id){
      console.log($scope.artistId);
      artistService.unfollowArtist($scope.artistId);
  };


  console.log($scope.artistInfo);
});
