/*
 * searchResultController
 *
 * Enable user interaction in nav.search-result ui state. The user's
 * search targets are in session.data().search.targets[]. Use $http
 * service to start search job, the display results.
 */
app.controller('searchResultController', function($scope, $state, $http,
  session, workLog) {
  
  // make session available in the view's scope
  $scope.session = session;
  
});
