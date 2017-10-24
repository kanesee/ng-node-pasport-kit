app.controller('registerCtrl',
  ['$scope'
  ,'$http'
  ,'AuthService'
  , controllerFn
  ]);

function controllerFn($scope
                    , $http
                    , AuthService
                    ) {
  $scope.error = null;
  $scope.user = {};
  
  // private vars
  var self = this;
  
  /**************************
   * scope functions
   *************************/
  
  $scope.register = function() {
    $scope.error = null;
    $scope.success = null;
    
    AuthService.register($scope.user.userid, $scope.user.password)
      .then(function(resp) {
        $scope.success = 'Registered!';
        
      })
      .catch(function(err) {
        if( err.status == 402 ) {
          $scope.error = 'UserId already taken';
        } else {
          $scope.error = err.statusText;
        }
      });
      
  }
  

}