angular.module('spotifyApp').controller('libraryController', function($scope, libraryService){
    $scope.library = {};
    $scope.library.items = [];
    $scope.offset = 0;

    $scope.getLib = function(){
      libraryService.getLibrary($scope.offset).then(function(result){
        result.data.items.forEach(function(item){
          $scope.library.items.push(item);
        });
      });
      $scope.offset += 20;
    };
    $scope.getLib();
});
