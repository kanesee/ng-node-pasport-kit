angular.module('dirAuthCtrl', [])
  .directive('authCtrl', [
      'AuthService',
      'UserSession',
      function(AuthService
              ,UserSession
              ) {
      return {
        restrict: 'E',
        templateUrl: '/ng/dirAuthCtrl/template.html',
        controller: function($scope) {
//          
//          $scope.logOut = function() {
//            AuthService.logOut();
//          }
  
          this.init = function() {
            console.log('initializing <auth-ctrl>');
          }
          this.init();
        }
      }
    }
  ])