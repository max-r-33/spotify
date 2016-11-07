angular.module('spotifyApp').controller('libraryController', function($scope, libraryService){
    $scope.library = {};
    $scope.library.items = [];
    $scope.getLib = function(){
      libraryService.getLibrary().then(function(result){
        $scope.library = result.data;
        console.log($scope.library);
      });
    };
    $scope.getLib();
});
