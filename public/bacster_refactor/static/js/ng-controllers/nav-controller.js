/*
 * navController
 *
 * Any user interaction with the site nav, not already implemented by
 * ui-router.  could be added to this controller. There are several
 * ways to implement navigation without adding any code to this
 * controller. See docs @ http://angular-ui.github.io/ui-router/site
 */
app.controller('navController', function($scope, $state, session) {

  // make session available in the view's scope
  $scope.session = session;

});
