angular.module('spotifyApp').controller('libraryController', function($scope, libraryService, spotifyService){
    $scope.library = {};
    $scope.library.items = [];
    $scope.offset = 0;

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
