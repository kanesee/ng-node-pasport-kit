app.controller('loginCtrl',
  ['$scope'
  , 'AUTH_EVENTS'
  , controllerFn
  ]);

function controllerFn($scope
                    , AUTH_EVENTS
                    ) {
  $scope.error = null;
  
  // private vars
  var self = this;
  
  /**************************
   * scope functions
   *************************/
  
  this.init = function() {
    $scope.$on(AUTH_EVENTS.loginSuccess, function (event, user) {
      console.log('Login successful: ' + user); // 'Data to send'
      $scope.error = null;
    });
    
    $scope.$on(AUTH_EVENTS.loginFailed, function (event, error) {
      console.log('login failed: ' + JSON.stringify(error));
      $scope.error = error.data;
    });
    
  }

  this.init();
}