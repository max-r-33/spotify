//filter to make iframes work with dynamic urls (for the spotify web player)
angular.module('spotifyApp').filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);
