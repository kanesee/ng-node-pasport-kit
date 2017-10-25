app.controller('UserCtrl',
  ['$scope'
  ,'$rootScope'
  ,'$http'
  ,'AuthService'
  ,'AUTH_EVENTS'
  ,'UserSession'
  ,'USER_ROLES'
  , controllerFn
  ]);

function controllerFn($scope
                    , $rootScope
                    , $http
                    , AuthService
                    , AUTH_EVENTS
                    , UserSession
                    , USER_ROLES
                    ) {
  
  // private vars
  var self = this;
  
  /**************************
   * scope functions
   *************************/
  
  $scope.user = null;
  $scope.roles = USER_ROLES;
  $scope.isAuthorized = AuthService.isAuthorized;
  
  $scope.login = function(loginUser) {
    AuthService.logIn(loginUser.userid, loginUser.password)
      .then(function(user) {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, user);
        $scope.user = user;
      })
      .catch(function(err) {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed, err);
      })
  }  
 
  $scope.logOut = function() {
    AuthService.logOut();
    $scope.user = null;
  }
  
  $scope.isLoggedIn = function() {
    return AuthService.isAuthenticated();
  }
  
  /**
   * In case the page refreshes or a new tab loads, check
   * if we have a user in storage
   **/
  this.init = function() {
    $scope.user = UserSession.getUser();
  }
  
  this.init();
  
}