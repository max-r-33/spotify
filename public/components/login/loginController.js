angular.module('spotifyApp').controller('loginController', function($scope, loginService) {

    //redirects to spotify permission request
    $scope.authorize = function() {
        loginService.authorize().then(function(resp) {
            window.location = "https://accounts.spotify.com/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=user-library-modify&response_type=token";
        });
    };
});
