app.controller('UserCtrl',
  ['$scope'
  ,'$http'
  ,'AuthService'
  ,'UserSession'
  ,'USER_ROLES'
  , controllerFn
  ]);

function controllerFn($scope
                    , $http
                    , AuthService
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
 
  $scope.setUser = function (user) {
    $scope.user = user;
  };
  
  $scope.logOut = function() {
    AuthService.logOut();
    $scope.setUser(null);
  }
  
}