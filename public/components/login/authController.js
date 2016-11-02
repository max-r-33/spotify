angular.module('spotifyApp').controller('authController', function($scope, spotifyService, $cookies) {

    //method to extract token from redirect url
    $scope.getToken = function() {
        var url = window.location.hash.substr(1);
        var elems = url.split('=');
        console.log(elems);
        console.log(elems[1].split('&'));
        $scope.token = (elems[1]);
    };

    //gets token from url
    $scope.getToken();

    //sets token
    spotifyService.setToken($scope.token);

    //redirects home after 1s
    setTimeout(function() {
        window.location = 'http://localhost:8080/';
    }, 1000);

});
