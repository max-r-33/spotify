var client_id = '9307698323d44b158135c48936a25dbf';
var redirect_uri = encodeURIComponent('http://localhost:8080/components/login/afterAuth.html');

angular.module('spotifyApp').service('loginService', function($cookies, $http) {
    this.isLoggedIn = false;
    //requests auth token from spotify
    this.authorize = function() {
        return $http({
            method: 'GET',
            url: "https://accounts.spotify.com/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=user-library-modify%20user-top-read%20user-library-read&response_type=token"
        });
    };

    //save token to a cookie that expires in 1hr
    this.setToken = function(token){
      var now = new Date();
      var time = now.getTime();
      time += 3600 * 1000;
      now.setTime(time);
      $cookies.put('token', token, {'expires': now});
      console.log(token);
      this.token = token;
      isLoggedIn = true;
    };

    //gets token from a cookie
    this.getToken = function() {
        token = $cookies.get('token');
        console.log(token);
        if(token){
          this.isLoggedIn = true;
        }else{
          this.isLoggedIn = false;
        }
        return token;
    };
});
