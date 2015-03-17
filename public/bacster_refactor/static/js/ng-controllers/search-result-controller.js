/*
 * searchResultController
 *
 * Enable user interaction in nav.search-result ui state. The user''s
 * search targets are in session.data().search.targets[]. Use $http
 * service to start search job, the display results.
 */
app.controller('searchResultController', function($scope, $state, $http, $resource, $location,
               Blast_targets, Coord_targets, Get_targets, Bacsession, Bac, Target, Bacitem, session, workLog) {

  $scope.results_low = [];
  $scope.results_high = [];

  if(! $scope.data) {
      $scope.data = {};
  }
  
  var gettar = new Get_targets.query({session: session.data().user.id},function(gettar){
      var bacsessions = [];
      angular.forEach(gettar, function(val, key) {           
             this.push(val.bacsession_id);
	 }, bacsessions);

         angular.forEach(bacsessions, function(bval, key) {
 	   if(session.data().search.targettype == "fasta" ){
             console.log("bacsess: " + bval + " location: " + window.location.origin);
	     var json_results = Blast_targets.query({bacsession: bval}, function(json_data){
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
  		           var link = dbval.seqid+":"+dbval.start+"-"+dbval.end;  
			   var rec = {
                               'Query'      : val.Query,                                       //blast: Query,
                               'Bac ID'     : dbval.feature_id,                                //db:    feature_id,
                               'E-Value'    : val.e_value,                                     //blast: E_value,
                               'Identities' : val.Identities,                                  //blast: Identities,
                               'Subject Length'  : val.Subject_Length,                         //blast: Subject_Length,
                               'bacsession_id'   : bval,
                               'chrpos'          : link,
                               'confidence'      : dbval.confidence == "low" ? "Submit for BAC Screening" : "Visually Select Best BAC",
			   };

                           if (dbval.confidence == "low" ) {
    		             $scope.results_low.push(rec);
			   } else {
  		             $scope.results_high.push(rec);
                           }
			   console.log(dbval.feature_id + " has confidence " + $scope.results_low);
			 });    
                     }); 
                 });
	     });
           }	 
       });
  });

  $scope.data.gridOptionsHigh = {
    data: 'results_high',    
    enableRowSelection: false,
    plugins: [new ngGridFlexibleHeightPlugin()],
    columnDefs: [{ field: 'Query', displayName: 'Query' },
  	         { field: 'Bac ID', displayName: 'Bac ID' },
		 { field: 'E-Value', displayName: 'E-Value' },
		 { field: 'Identities', displayName: 'Identities' },
		 { field: 'Subject Length', displayName: 'Subject Length' },
                 { field: 'bacsession_id', visible: false },
		 { field: 'chrpos', displayName: 'ChrPos' },
	         { field: 'confidence', 
                   displayName: 'Action', 
                   cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">\
                                    <a href="'+window.location.origin+'/bacster/crud/format_jbrowse/{% verbatim %}{{ row.getProperty(\'bacsession_id\') }}{% endverbatim %}/{% verbatim %}{{ row.getProperty(\'chrpos\') }}{% endverbatim %}" target="_blank">\
                                      {% verbatim %} {{ row.getProperty(col.field) }} {% endverbatim %}\
                                    </a>\
                                  </div>' }
                ]
  };


  $scope.data.gridOptionsLow = {
    data: 'results_low',
    enableRowSelection: false,
    plugins: [new ngGridFlexibleHeightPlugin()],
    columnDefs: [{ field: 'Query', displayName: 'Query' },
                 { field: 'Bac ID', displayName: 'Bac ID' },
                 { field: 'E-Value', displayName: 'E-Value' },
                 { field: 'Identities', displayName: 'Identities' },
                 { field: 'Subject Length', displayName: 'Subject Length' },
                 { field: 'bacsession_id', visible: false },
                 { field: 'chrpos', displayName: 'ChrPos' },
                 { field: 'confidence',
		 displayName: 'Action',
		 cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">\
                                    <a href="'+window.location.origin+'/bacster/crud/format_jbrowse/{% verbatim %}{{ row.getProperty(\'bacsession_id\') }}{% endverbatim %}/{% verbatim %}{{ row.getProperty(\'chrpos\') }}{% endverbatim %}" target="_blank">\
                                      {% verbatim %} {{ row.getProperty(col.field) }} {% endverbatim %}\
                                    </a>\
                                  </div>' }
                ]
	};

/*
  $scope.$on('ngGridEventData', function(){
      $scope.data.gridOptions.selectRow(0, true);
      console.log("selected: " + $scope.data.gridOptions.selectedItems[0].ChrPos);
  });

  $scope.selectRow = function(){
      angular.forEach($scope.results, function(data, index){
	  console.log("selected: " + data.ChrPos);
      });
  };
*/

});
