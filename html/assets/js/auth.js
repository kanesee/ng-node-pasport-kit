app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

app.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  editor: 'editor',
  guest: 'guest'
})

app.factory('AuthService', function ($http, $window, UserSession) {
  var authService = {};
  
  authService.logIn = function(userid, password) {
    return $http({
      method: 'POST',
      url: '/auth/login',
      headers: {
        'Authorization': 'Basic ' + btoa(userid + ':' + password)
      }
    })
      .then(function(resp) {
        var user = null;
        if( resp.data ) {
          user = resp.data.user;
          UserSession.create(resp.data.user, resp.data.token);
//          $window.localStorage.setItem('token', resp.data.token);
        }
        return user;
      })
  };

  authService.isAuthenticated = function () {
    return !!UserSession.user;
  };
  
  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(UserSession.userRole) !== -1);
  };
  
  authService.logOut = function() {
    UserSession.destroy();
    $window.localStorage.removeItem('token');
  },

  authService.register = function(userid, password) {
    var user = {userid: userid, password: password};
    return $http.post('/auth/register', user);
  }
    
//    changePassword: function(username, password, newpassword) {
//        return $http.post('/user/password',
//                          { username: username
//                          , password: password
//                          , newpassword: newpassword});
//    },
//
//    resetPassword: function(username, resetToken, newpassword) {
//        return $http.post('/user/password/reset',
//                          { username: username
//                          , resetToken: resetToken
//                          , newpassword: newpassword});
//    }


  return authService;
});

app.service('UserSession', function() {
  
  this.create = function (user, token) {
    this.user = user;
    this.token = token;
  };
  
  this.destroy = function () {
    this.user = null;
    this.token = null;
  };
  
})

/************************************
 * Intercepts requests and responses
 * for authentication purpose
 ***********************************/
app.factory('authHandler', [
    '$q'
  , '$window'
  , '$location'
  , 'UserSession'
  , function($q
           , $window
           , $location
           , UserSession
           ) {
    return {
      request: function(config) {
        config.headers = config.headers || {};
//        if( $window.localStorage.token 
        if( UserSession.token
        &&  !config.headers.Authorization
        ) {
            config.headers.Authorization = 'Bearer ' + UserSession.token
        }
        return config;
      },
      responseError: function(rejection) {
        if (rejection != null && rejection.status === 401) {
//          $window.localStorage.removeItem('token');
          UserSession.destroy();
          $location.url("/login");
        }

        return $q.reject(rejection);
      }
    };
}]);

app.config(['$httpProvider',
  function($httpProvider) {  
    $httpProvider.interceptors.push('authHandler');
  }
]);