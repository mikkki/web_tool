/*
 * workLogController 
 *
 * Any user interaction on the nav.worklog ui state should go
 * here. Note there is an associated service named workLog, which can
 * be utilized by any controller for logging work.
 */
app.controller('workLogController', function($scope, $state, $stateParams, workLog) {

    $scope.requestId = $stateParams.requestId;
    console.log("requestId: " + $scope.requestId);

});
