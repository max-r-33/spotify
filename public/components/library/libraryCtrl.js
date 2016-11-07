angular.module('spotifyApp').controller('libraryController', function($scope, libraryService, loginService, spotifyService){
    $scope.library = {};
    $scope.library.items = [];
    $scope.offset = 0;

    $scope.getToken = function() {
        $scope.token = loginService.getToken();
        //redirects if user not logged in
        if(!$scope.token){
          window.location='/';
        }
    };
    $scope.getToken();

    $scope.getLib = function(){
      libraryService.getLibrary($scope.offset).then(function(result){
        result.data.items.forEach(function(item){
          $scope.library.items.push(item);
        });
        addSavedProp($scope.library.items);
      });
      $scope.offset += 20;
    };

    $scope.removeSong = function(id){
      spotifyService.removeTrack(id);
    };

    $scope.saveSong = function(id){
      spotifyService.saveTrack(id);
    };

    var addSavedProp = function(tracks){
      tracks.forEach(function(track){
        track.alreadySaved = true;
      });
    };


    $scope.getLib();
});
