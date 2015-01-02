/*
 * sessionController
 *
 * Enable user interaction on the nav.session ui state.
 */
app.controller('sessionController_new', ['$scope', 'Session', function($scope, Session) {
    //Query returns an array of objects, MyModel.objects.all() by default
    $scope.models = Session.query();
    // a model for data binding
    $scope.user = {
      pioneerId : '',
      notes : ''
    };

  // callback to start a new session
    $scope.startSession = function() {
      var new_session = new Session({pioneer_id: $scope.user.pioneerId, notes: $scope.user.notes});
      new_session.$save(function(){
	  $scope.models.push(new_session);
      }); // In callback we push our new object to the models array

      $state.go('nav.home');
  };
}]);

app.controller('sessionController', ['$scope', 'Session', '$state', 'session', function($scope, Session, $state, session) {

  //Query returns an array of objects, MyModel.objects.all() by default
  $scope.models = Session.query();

  // a model for data binding
  $scope.user = {
    pioneerId : '',
    notes : ''
  };
  
  // the pioneer-id field has autofocus attribute, but that doesn't
  // seem to work with single-page-app navigation. so use jquery to
  // focus the input field.
  $('#session-pioneer-id').focus();

  // callback to start a new session
  $scope.startSession = function() {

    // TODO: user input validation
    
    session.data().user = {
      pioneerId : $scope.user.pioneerId,
      notes : $scope.user.notes,
      timestamp : new Date().toLocaleDateString("en-US")
    };
    session.save();

    var new_session = new Session({pioneer_id: $scope.user.pioneerId, notes: $scope.user.notes});
    new_session.$save(function(){
	$scope.models.push(new_session);
    }); // In callback we push our new object to the models array
  
    // use the ui-router service to redirect user to home now that a
    // session is established
    $state.go('nav.home');
  };
}]);