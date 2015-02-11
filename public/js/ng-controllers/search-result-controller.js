/*
 * searchResultController
 *
 * Enable user interaction in nav.search-result ui state. The user''s
 * search targets are in session.data().search.targets[]. Use $http
 * service to start search job, the display results.
 */
app.controller('searchResultController', function($scope, $state, $http, $resource,
               Blast_targets, Coord_targets, Get_targets, Bacsession, Bac, Target, Bacitem, session, workLog) {

  $scope.results = [];

  if(! $scope.data) {
      $scope.data = {};
  }
  
  var gettar = new Get_targets.query({session: session.data().user.id},function(gettar){
      var bacsessions = [];
      angular.forEach(gettar, function(val, key) {           
             this.push(val.bacsession_id);
	 }, bacsessions);

         angular.forEach(bacsessions, function(val, key) {
 	   if(session.data().search.targettype == "fasta" ){

	     var json_results = Blast_targets.query({bacsession: val}, function(json_data){
                 angular.forEach(json_data, function(val, key) {
                     /* key is array index; val is an object like:
  		        {"Percent_Identity":"98.33",
			"Query_Stop":"60",
			"Subject_Length":"6262",
			"Query":"ZmChr0v2-2",
			"Query_Start":"1",
			"Query_Length":"2200",
			"e_value":"1e-19",
			"Identities":"58/60",
			"Alignment_Length":"60",
			"Subject":"HC69.SP17.P1.F09_cbachc69h.pk113.f9_NODE_14_length_6262"
			}
                     */
		     var feature_id = val.Subject.match(/^([^_]+)_/)[1];
                     //get the record(s) from bacster_bacitem corresponding to this feature_id:
		     var positions = Bacitem.query({feature_id: feature_id}, function(db_data){
                         angular.forEach(db_data, function(dbval, dbkey) {
			   this.push(     {
			       'Query'      : val.Query,                                       //blast: Query,
			       'Bac ID'     : dbval.feature_id,                                //db:    feature_id,
			       'E-Value'    : val.e_value,                                     //blast: E_value,
			       'Identities' : val.Identities,                                  //blast: Identities,
			       'Subject Length'  : val.Subject_Length,                         //blast: Subject_Length,
			       'ChrPos'     : dbval.seqid+":"+dbval.start+"-"+dbval.end,       //db:    seqid:start-end
			   }); 
			 }, $scope.results);    
                     }); 
                 });
	     });
           } else {
	       var json_results = Coord_targets.query({bacsession: val}, function(json_data){
		   angular.forEach(json_data, function(val, key) {    
		       this.push({
                               'SeqID'      : val.SeqID,
                               'Bac ID'     : val.BacID,
                               'Score'      : val.Score, 
                               'ChrPos'     : val.Region,
 			       });
                   }, $scope.results);
	       });
           }	 
       });
  });

  $scope.data.gridOptions = {
    data: 'results',    
    plugins: [new ngGridFlexibleHeightPlugin()]
  };
});
