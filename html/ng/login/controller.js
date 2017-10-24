app.controller('loginCtrl',
  ['$scope'
  ,'$rootScope'
  ,'$http'
  ,'$window'
  ,'$location'
  , 'AuthService'
  , 'AUTH_EVENTS'
  , controllerFn
  ]);

function controllerFn($scope
                    , $rootScope
                    , $http
                    , $window
                    , $location
                    , AuthService
                    , AUTH_EVENTS
                    ) {
  $scope.error = null;
  $scope.user = {};
  
  // private vars
  var self = this;
  
  /**************************
   * scope functions
   *************************/
  
  $scope.login = function() {
    $scope.error = null;
    
    AuthService.logIn($scope.user.userid, $scope.user.password)
      .then(function(user) {
//        $location.path('/');
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $scope.setUser(user);      
      })
      .catch(function(err) {
        $scope.error = err.data;
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      })
  }
  
  $scope.isLoggedIn = function() {
    return AuthService.isAuthenticated();
  }

}