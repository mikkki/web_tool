/*
 * sessionController
 *
 * Enable user interaction on the nav.session ui state.
 */

app.controller('sessionController', ['$scope', 'Session', '$state', 'session', function($scope, Session, $state, session) {

  //Query returns an array of objects, MyModel.objects.all() by default
  $scope.models = Session.query();

  // a model for data binding
  $scope.user = {
    id : '',
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
      id: '', 
      pioneerId : $scope.user.pioneerId,
      notes : $scope.user.notes,
      timestamp : new Date().toLocaleDateString("en-US")
    };
    session.save();

    var new_session = new Session({pioneer_id: $scope.user.pioneerId, notes: $scope.user.notes});
    new_session.$save(function(){
      new_id = $scope.models.push(new_session);
      $scope.user.id = new_id;
      session.data().user.id = new_id;
      session.save();

      console.log("new ID:  " + new_id);  
      console.log("session ID!!:  " + JSON.stringify(session.data().user.id));
      console.log("scope.user ID :  " + JSON.stringify($scope.user));
    }); // In callback we push our new object to the models array


    // use the ui-router service to redirect user to home now that a
    // session is established
    $state.go('nav.home');
  };
}]);
