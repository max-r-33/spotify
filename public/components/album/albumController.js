angular.module('spotifyApp').controller('albumController', function($scope, $stateParams, albumService, spotifyService) {
    $scope.albumId = $stateParams.id;
    $scope.getAlbum = function() {
        albumService.getAlbumInfo($scope.albumId).then(function(response) {
            $scope.albumInfo = response;
        });
    };

    $scope.saveSong = function(id) {
        spotifyService.saveTrack(id);
    };

    $scope.removeSong = function(id) {
        spotifyService.removeTrack(id);
    };

    $scope.saveAlbum = function(id) {
        spotifyService.saveAlbum(id);
    };

    $scope.removeAlbum = function(id) {
        spotifyService.removeAlbum(id);
    };
    $scope.getAlbum();


});
