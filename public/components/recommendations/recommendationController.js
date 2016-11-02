var client_id = '9307698323d44b158135c48936a25dbf';
var redirect_uri = encodeURIComponent('http://localhost:8080/afterAuth.html');

angular.module('spotifyApp').controller('recommendationController', function($scope, spotifyService, loginService) {

    //gets token from saved coookie
    $scope.getToken = function() {
        $scope.token = loginService.getToken();

        //redirects if user not logged in
        if(!$scope.token){
          window.location='/';
        }
    };

    //gets saved token when page is loaded
    $scope.getToken();

    //gets recommendations based on seeds
    $scope.getRecommendations = function() {
        spotifyService.getRecs($scope.artistName, $scope.songName, $scope.genreName).then(function(recs) {
            console.log(recs);
            $scope.recommendations = recs.data;
        });
    };

    //saves song to user's library
    $scope.saveSong = function(id) {
        spotifyService.saveTrack(id).then(function(res) {
            console.log(res);
        });
    };
});
