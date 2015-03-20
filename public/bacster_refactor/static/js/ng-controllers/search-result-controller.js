/*
 * searchResultController
 *
 * Enable user interaction in nav.search-result ui state. The user''s
 * search targets are in session.data().search.targets[]. Use $http
 * service to start search job, the display results.
 */
app.controller('searchResultController', function($scope, $state, $http, $resource, $location, $q,
               Blast_targets, Coord_targets, Get_targets, Bacsession, Bac, Target, Bacitem, session, workLog) {

  if(! $scope.data) {
      $scope.data = {};
  }

  $scope.tablist = '';  
  $scope.tabcontent ='';

  var gettar = new Get_targets.query({session: session.data().user.id},function(gettar){
      var bacsessions = [];
      angular.forEach(gettar, function(val, key) {           
             this.push(val.bacsession_id);
	 }, bacsessions);

         var first_tab = ' class="active"';
         angular.forEach(bacsessions, function(bval, key) {
	   var results_low = '$scope.results_low_'+bval+' = [];'
	   eval(results_low);
           var results_high = '$scope.results_high_'+bval+' = [];'
	   eval(results_high);

 	   if(session.data().search.targettype == "fasta" ){
             console.log("bacsess: " + bval );
	     var json_results = Blast_targets.query({bacsession: bval}, function(json_data){
                 var count_inner = 0;
                 angular.forEach(json_data, function(val, key) {
                   console.log("val.Query: " + val.Query + " count_inner : " + count_inner);
                   if (count_inner === 0) {
                       //dynamically adding a nav tab:
	 	       $scope.tablist = $scope.tablist.concat('<li role="presentation"'+first_tab+'><a href="#dynamic-'+bval+'" aria-controls="dynamic-'+bval+'" role="tab" data-toggle="tab">'+val.Query+'</a></li>');
                       if (first_tab) { first_tab = ' active'; }
                       // dynamically adding a tab pane:    	             
                       $scope.tabcontent = $scope.tabcontent.concat('<div role="tabpanel" class="tab-pane'+first_tab+'" id="dynamic-'+bval+'">\
                       <div class="k-block">\
                         <div class="k-header">High Confidence</div>\
                         <div ng-show="! results_high_'+bval+'.length"><img src="/static/images/ajax-loader.gif"></div>\
                         <div width="100%" class="gridStyle" ng-grid="data.gridOptionsHigh_'+bval+'" ng-if="results_high_'+bval+'.length > 0"></div>\
                       </div>\
                       </br>\
                       <div class="k-block">\
                         <div class="k-header">Low Confidence</div>\
                         <div ng-show="! results_low_'+bval+'.length"><img src="/static/images/ajax-loader.gif"></div>\
                         <div width="100%" class="gridStyle" ng-grid="data.gridOptionsLow_'+bval+'" ng-if="results_low_'+bval+'.length > 0"></div>\
                       </div>\
                       </div>');
                       if (first_tab) { first_tab = ''; }   	             
		   }
                   count_inner++;
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
		         // adding a record to the low confidence list of results:  
			 eval('$scope.results_low_'+bval+'.push(rec)');
		       } else {
 		         //adding a record to the high confidence list of results:
			 eval('$scope.results_high_'+bval+'.push(rec)');
                       }
		     });    
                   });
                 });  //json_data

                 $scope.gridOptionsHigh = {
                   data: 'results_high_'+bval,    
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
                       <a href="'+window.location.origin+'/bacster/crud/format_jbrowse/{% verbatim %}{{ row.getProperty(\'bacsession_id\') }}{% endverbatim %}/{% verbatim %}{{ row.getProperty(\'chrpos\') }}{% endverbatim %}" \
                       target="_blank">\
                         {% verbatim %} {{ row.getProperty(col.field) }} {% endverbatim %}\
                       </a>\
                       </div>' }
                   ]
                 };

                 $scope.gridOptionsLow = {
                   data: 'results_low_'+bval,
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
                       <a href="'+window.location.origin+'/bacster/crud/format_jbrowse/{% verbatim %}{{ row.getProperty(\'bacsession_id\') }}{% endverbatim %}/{% verbatim %}{{ row.getProperty(\'chrpos\') }}{% endverbatim %}" \
                       target="_blank">\
                         {% verbatim %} {{ row.getProperty(col.field) }} {% endverbatim %}\
                       </a>\
                       </div>' }
                   ]
	         };

                 eval('$scope.data.gridOptionsHigh_'+bval+'=$scope.gridOptionsHigh');
                 eval('$scope.data.gridOptionsLow_'+bval+'=$scope.gridOptionsLow');

               });
            } 
        }); //bacsessions
    });
});


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

 /* angular.forEach(json_data, function(val, key) {
   key is arr index; val is an object like:
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
