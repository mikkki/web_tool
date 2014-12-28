/* 
 * homeController
 *
 * Any user interaction in nav.home could be added to this controller.
 */
app.controller('homeController', function($scope, $state, session) {

  // make session available in the view's scope
  $scope.session = session;
  
});

