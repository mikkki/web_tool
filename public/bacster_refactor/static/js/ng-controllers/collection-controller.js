/*
 * collectionController
 *
 * Let user view/manipulate collection of BACs in a tabular view. Persist
 * the collection via the session service.
 */
app.controller('collectionController', function($scope, $state, session) {

  // make session available in the view's scope
  $scope.session = session;
  
  // generate some mockup data. TODO: maintain the collection using the
  // session service.
  if (! session.data().selectedBACs ) {
    
      session.data().selectedBACs = [
      {
        id : 'HC69.SP01.P1.E05',
        seqname : 'ZmChr10v2',
        feature : 'gene',
        start : 129532921,
        end : 129684664,
        score : 0.954228
      },
      {
        id : 'HC69.SP01.P1.E12',
        seqname : 'ZmChr4v2',
        feature : 'gene',
        start : 118728585,
        end : 118846760,
        score : 0.967699
      },
      {
        id : 'HC69.SP01.P1.F09',
        seqname : 'ZmChr1v2',
        feature : 'gene',
        start : 307081085,
        end : 307388922,
        score : 0.949583
      },
      {
        id : 'HC69.SP01.P1.F18',
        seqname : 'ZmChr6v2',
        feature : 'gene',
        start : 55123002,
        end : 55380523,
        score : 0.944984
      }
    ];
  }
  
  $scope.gridOptions = {
    data: 'session.data().selectedBACs',
    plugins: [new ngGridFlexibleHeightPlugin()]
  };

});
