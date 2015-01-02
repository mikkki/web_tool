/*
 * sessionController
 *
 * Enable user interaction on the nav.session ui state.
 */
app.controller('sessionController', function($scope, $state, session, workLog) {

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

    // use the workLog service
    workLog.addLog(session.data().user.pioneerId,
                   'New Session: ' + $scope.user.notes,
                   '');
    
    // use the ui-router service to redirect user to home now that a
    // session is established
    $state.go('nav.home');
  };
});
