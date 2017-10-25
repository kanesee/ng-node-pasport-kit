const USER_ACTIVE_UNTIL = {
  pageRefresh: 'localvar',
  sessionExpires: 'sessionStorage',
  forever: 'localStorage'
}

const SESSION_PERSISTANCE = USER_ACTIVE_UNTIL.forever;


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
});

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
          UserSession.create(user, resp.data.token);
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

app.service('UserSession', [
  '$window',
  function($window) {
    var user;
    var token;
  
    this.create = function (user, token) {
      switch(SESSION_PERSISTANCE) {
        case USER_ACTIVE_UNTIL.pageRefresh:
          user = user;
          token = token;
          break;
        case USER_ACTIVE_UNTIL.sessionExpires:
          $window.sessionStorage.setItem('user', JSON.stringify(user));
          $window.sessionStorage.setItem('token', JSON.stringify(token));
          break;
        case USER_ACTIVE_UNTIL.forever:
          $window.localStorage.setItem('user', JSON.stringify(user));
          $window.localStorage.setItem('token', JSON.stringify(token));
          break;
      }
    };

    this.destroy = function () {
      user = null;
      token = null;
      $window.sessionStorage.removeItem('user');
      $window.sessionStorage.removeItem('token');
      $window.localStorage.removeItem('user');
      $window.localStorage.removeItem('token');
    };

    this.getUser = function() {
      switch(SESSION_PERSISTANCE) {
        case USER_ACTIVE_UNTIL.pageRefresh:
          return user;
        case USER_ACTIVE_UNTIL.sessionExpires:
          var user = $window.sessionStorage.user;
          if( user ) {
            user = JSON.parse(user);
          }
          return user;
        case USER_ACTIVE_UNTIL.forever:
          var user = $window.localStorage.user;
          if( user ) {
            user = JSON.parse(user);
          }
          return user;
      }
    }
    
    this.getToken = function() {
      switch(SESSION_PERSISTANCE) {
        case USER_ACTIVE_UNTIL.pageRefresh:
          return token;
        case USER_ACTIVE_UNTIL.sessionExpires:
          var token = $window.sessionStorage.token;
          if( token ) {
            token = JSON.parse(token);
          }
          return token;
        case USER_ACTIVE_UNTIL.forever:
          var token = $window.localStorage.token;
          if( token ) {
            token = JSON.parse(token);
          }
          return token;
      }
    }
  }
])

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
        var token = UserSession.getToken();
        if( token
        &&  !config.headers.Authorization
        ) {
            config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
      },
      responseError: function(rejection) {
        if (rejection != null && rejection.status === 401) {
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