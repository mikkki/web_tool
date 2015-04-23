/*
 * searchResultController
 *
 * Enable user interaction in nav.search-result ui state. The user''s
 * search targets are in session.data().search.targets[]. Use $http
 * service to start search job, the display results.
 */
app.controller('searchResultController', function($scope, $state, $http, $resource, $cookieStore, $window, $route, $q, $location,
               FormatJbrowse, Blast_targets, Coord_targets, Get_targets, Bacsession, Bac, Target, Bacitem, session, workLog) {

  if(! $scope.data) {
      $scope.data = {};
  }

  $scope.tablist = '';  
  $scope.tabcontent ='';  

  function create_tabs(first_tab, bval, query) {
	 	       $scope.tablist = $scope.tablist.concat('<li role="presentation"'+first_tab+'><a href="#dynamic-'+bval+'" aria-controls="dynamic-'+bval+'" role="tab" data-toggle="tab">'+query+'</a></li>');
                       if (first_tab) { first_tab = ' active'; }
                       // dynamically adding a tab pane:    	             
                       $scope.tabcontent = $scope.tabcontent.concat('<div role="tabpanel" class="tab-pane'+first_tab+'" id="dynamic-'+bval+'">\
                       <div class="k-block" ng-if="results_high_'+bval+'.length > 0">\
                         <div class="k-header">High Confidence</div>\
                         <div ng-show="! results_high_'+bval+'.length"><img src="/static/images/ajax-loader.gif"></div>\
                         <div width="100%" class="gridStyle" ng-grid="data.gridOptionsHigh_'+bval+'" ng-if="results_high_'+bval+'.length > 0"></div>\
                       </div>\
                       </br>\
                       <div class="k-block" ng-if="results_low_'+bval+'.length > 0">\
                         <div class="k-header">Low Confidence</div>\
                         <div ng-show="! results_low_'+bval+'.length"><img src="/static/images/ajax-loader.gif"></div>\
                         <div width="100%" class="gridStyle" ng-grid="data.gridOptionsLow_'+bval+'" ng-if="results_low_'+bval+'.length > 0"></div>\
                       </div>\
                       </br>\
                       <div class="k-block" ng-if="results_nohit_'+bval+'.length > 0">\
                         <div class="k-header">No Hits</div>\
                         <div ng-show="! results_nohit_'+bval+'.length"><img src="/static/images/ajax-loader.gif"></div>\
                         <div width="100%" class="gridStyle" ng-grid="data.gridOptionsNohit_'+bval+'" ng-if="results_nohit_'+bval+'.length > 0"></div>\
                       </div>\
                       </div>');
  }

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
           var results_nohit = '$scope.results_nohit_'+bval+' = [];'
           eval(results_nohit);

 	   if(session.data().search.targettype == "fasta" ){
             console.log("bacsess: " + bval );
	     var json_results = Blast_targets.query({bacsession: bval}, function(json_data){

                 var count_inner = 0;
                 angular.forEach(json_data, function(val, key) {
                   var query;
                   if (count_inner === 0) {
                       if (val.Subject) {
		         query = val.Query;  
		       } else {
		         query = val.seq.match(/>([^\s]+)\s/)[1];
		       }
                       //dynamically adding a nav tab:
		       create_tabs(first_tab, bval, query);
                       if (first_tab) { first_tab = ''; }   	             
	           }
                   count_inner++;

		   if (val.Subject) {       // in case there are hits:
 		     var feature_id = val.Subject.match(/^([^_]+)_/)[1];
                     //get the record(s) from bacster_bacitem corresponding to this feature_id:
		     var positions = Bacitem.query({feature_id: feature_id}, function(db_data){
                       angular.forEach(db_data, function(dbval, dbkey) {
  		         var link = dbval.seqid+":"+dbval.start+"-"+dbval.end;  
		         var rec = {
                               'Query'      : val.Query,                                       //blast: Query,
                               'BAC'        : dbval.feature_id,                                //db:    feature_id,
                               'BAC ID'     : dbval.bacid,                                //db:    feature_id,
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
	           }  
		   else {  // in case no hits are found:
		     var rec = {
                       'Query'          : query,
		       'bacsession_id'  : bval,
                       'confidence'     : "No hit found - send for screening"
                     } 
	             eval('$scope.results_nohit_'+bval+'.push(rec)');
		   }
                 });  //json_data

		 $scope.click = function (bacsession_id, chrpos) {
                     $scope.jbrowse = '';
		     function format_jbrowse(bacsession_id, coords) {
			 return function(resolve, reject) {
			     var jb = $resource('crud/format_jbrowse/:bacsession/:region', {"bacsession": "@bacsession", "region": "@region"}, {'query':  {method:'GET', isArray:false}});
                             var jbquery = jb.query({bacsession: bacsession_id, region: coords}, function(jbrowse){
				 if (jbrowse.url) {
                                     $scope.jbrowse = jbrowse.url;
				     resolve();
				 } else {
				     reject({"error":"no track data"});
				 }
			     });
			 }
		     }
                     var promises = [];
		     var pr = new Promise(format_jbrowse(bacsession_id, chrpos));
		     promises.push(pr);
                     $q.all(promises)
		     .then(function(){
			 // TODO: make sure the tracks are added to the SAME window instaed of opening a new one for each track:
  		         $window.open("http://" + $scope.jbrowse, "JBrowse"+bacsession_id);
			 console.log("opening jbrowse .. ");
		     });        
                 }                   

                 $scope.gridOptionsHigh = {
                   data: 'results_high_'+bval,    
                   enableRowSelection: false,
                   plugins: [new ngGridFlexibleHeightPlugin()],
                   columnDefs: [{ field: 'Query', displayName: 'Query' },
   		     { field: 'BAC', displayName: 'BAC' },
		     { field: 'BAC ID', displayName: 'BAC ID' },
		     { field: 'E-Value', displayName: 'E-Value' },
		     { field: 'Identities', displayName: 'Identities' },
		     { field: 'Subject Length', displayName: 'Subject Length' },
                     { field: 'bacsession_id', visible: false },
		     { field: 'chrpos', displayName: 'ChrPos' },
	             { field: 'confidence', 
                       displayName: 'Action', 
                       cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">\
                       <a href="" ng-click="click(row.getProperty(\'bacsession_id\'), row.getProperty(\'chrpos\'))" \
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
                     { field: 'BAC', displayName: 'BAC' },
   		     { field: 'BAC ID', displayName: 'BAC ID' },
                     { field: 'E-Value', displayName: 'E-Value' },
                     { field: 'Identities', displayName: 'Identities' },
                     { field: 'Subject Length', displayName: 'Subject Length' },
                     { field: 'bacsession_id', visible: false },
                     { field: 'chrpos', displayName: 'ChrPos' },
                     { field: 'confidence',
		       displayName: 'Action',
		       cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">\
                       <a href="" ng-click="click(row.getProperty(\'bacsession_id\'), row.getProperty(\'chrpos\'))" \
                       target="_blank">\
                         {% verbatim %} {{ row.getProperty(col.field) }} {% endverbatim %}\
                       </a>\
                       </div>' }
                   ]
	         };

                 $scope.gridOptionsNohit = {
                   data: 'results_nohit_'+bval,
                   enableRowSelection: false,
                   plugins: [new ngGridFlexibleHeightPlugin()],
                   columnDefs: [{ field: 'Query', displayName: 'Query' },
				{ field: 'bacsession_id', visible: false },
				{ field: 'confidence',
				displayName: 'Action',
				cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()">\
                       <a href="" ng-click="click(row.getProperty(\'bacsession_id\'), undef)" \
                       target="_blank">\
                         {% verbatim %} {{ row.getProperty(col.field) }} {% endverbatim %}\
                       </a>\
                       </div>' }
                   ]
		 };

                 eval('$scope.data.gridOptionsHigh_'+bval+'=$scope.gridOptionsHigh');
                 eval('$scope.data.gridOptionsLow_'+bval+'=$scope.gridOptionsLow');
                 eval('$scope.data.gridOptionsNohit_'+bval+'=$scope.gridOptionsNohit');
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
