angular.module('spotifyApp').controller('artistController', function($scope, $stateParams, artistService, spotifyService) {
    $scope.artistId = $stateParams.id;
    console.log($scope.artistId);
    //gets artist info
    artistService.getArtistInfo($scope.artistId).then(function(result) {
        $scope.artistInfo = result;
        console.log($scope.artistInfo);
    });

    //follows artist
    $scope.follow = function() {
        artistService.followArtist($scope.artistId);
    };


    //unfollows artist
    $scope.unfollow = function() {
        artistService.unfollowArtist($scope.artistId);
    };

    //saves song to user's library
    $scope.saveSong = function(id) {
        spotifyService.saveTrack(id);
    };

    //removes saved song from user's library
    $scope.removeSong = function(id) {
        spotifyService.removeTrack(id);
    };

});
