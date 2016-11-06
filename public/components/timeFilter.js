angular.module('spotifyApp').filter('timeFilter',function(){

    return function (s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        if(secs < 10){
          secs = secs + '0';
        }
        return mins + ':' + secs;
    };
});
