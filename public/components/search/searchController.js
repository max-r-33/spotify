angular.module('spotifyApp').controller('searchController', function($scope, searchService){
    $scope.hideLabels = true;
    $scope.search = function(term){
      searchService.search(term).then(function(result){
        console.log(result);
        $scope.hideLabels = false;
        $scope.result = result;
        console.log($scope.result);
      });
    };
});
