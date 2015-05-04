/*
 * searchController
 *
 * Enable user interaction in nav.search ui state
 */
app.controller('searchController', function($scope, $state, $http, $resource, $cookieStore, $window, $route, $q,
					    FormatJbrowse, Session, Organism, Genome, Bacset, Target, Targettype, Bac, Bacsession, Get_targets, session, workLog) {

  // make session available in the view''s scope
  $scope.session = session;

  // start a hash for search info in session, if it doesn''t exist yet
  if( ! session.data().search ) {
    session.data().search = {};
  }

  // it is recommended for ng-model to have a "dot" e.g. $scope.data.whatever
  if(! $scope.data) {
    $scope.data = {};
  }

  if( ! $scope.myData ) {
    $scope.myData = []
  }
 
  /*
   * organisms 
   */

  // the available organisms loaded from the database:
  $scope.data.organismSource = {};

  var pr1 = new Promise(function(resolve, reject){
    var o = Organism.query({}, function(){
      $scope.data.organismSource = { 'type' : 'json', 'data' : o };
    });
    resolve($scope.data.organismSource);
  });

  /*
   * genomes
   */

  var genomeReferences = {};

  var pr2 = new Promise(function(resolve, reject){
    var g = Genome.query({}, function(){
      angular.forEach(g, function(genome, key) {
          if (this[genome.organism]) {
              this[genome.organism].push({ 'genomeName' : genome.label, 'id' : genome.pk});
          } else {
              this[genome.organism] = [{ 'genomeName' : genome.label, 'id' : genome.pk}];
          }
      }, genomeReferences);
    });
    resolve(genomeReferences);
  });

  /*
   * DbS datasets
   */

  var dbsDatasets = {};

  var pr3 = new Promise(function(resolve, reject){
    var bs = Bacset.query({}, function(){
      angular.forEach(bs, function(bacset, key) {
          //this refers to a dbsDatasets elem
          if (this[bacset.genome]) {
            this[bacset.genome].push({ 'name' : bacset.label, 'id' : bacset.pk});
  	  } else {
	    this[bacset.genome] = [{ 'name' : bacset.label, 'id' : bacset.pk}];  
          }
      }, dbsDatasets);
    });
    resolve(dbsDatasets);
  });

  var init_promises = [];
  init_promises.push(pr1, pr2, pr3);

  $q.all(init_promises)
    .then(function(){
        if( ! session.data().search.organism) {
            session.data().search.organism = $scope.data.organism;
        }
        session.save();
    })
    .then(function(){
      $scope.data.genomeSource  = { 'type' : 'json', 'data' : genomeReferences[session.data().search.organism]};
    })
    .then(function(){
	if( ! session.data().search.genome) {
            session.data().search.genome = $scope.data.genome;
        }
        session.save();
    })
    .then(function(){
	$scope.data.dbsSource = { 'type' : 'json', 'data' : dbsDatasets[session.data().search.genome] };
    })
    .then(function(){        
	if( ! session.data().search.dbs) {
	    session.data().search.dbs = $scope.data.dbs;
	}
	session.save();
    });

  /*
   * data options
  */
  
  function set_targets() {
        var gettar = new Get_targets.query({session: session.data().user.id},function(gettar){  
        angular.forEach(gettar, function(val, key) { 	
             //set the target type:
             session.data().search.targettype = val.label;
	     session.save();

             if (val.label == "fasta") {
               this.push({ 'target' : val.seq, 'search type' : val.label});                 
             } else {
  	       this.push({ 'target' : val.coords, 'search type' : val.label});
             }
        }, $scope.myData);
      });    
  };
  
  set_targets();

  $scope.data.gridOptions = {
    data: 'myData',
    plugins: [new ngGridFlexibleHeightPlugin()]
  };


  //calls blast on server side EDIT this later target does nothing, nav.search
  $scope.BlastTargets = function(target){
    console.log("my target is: " + target);
    var blast = $resource('crud/blast_targets', {}, {'query':  {method:'GET', isArray:true}});
    var json_results = blast.query({}, function(){
      //for (var key in json_results){
        //if (json_results.hasOwnProperty(key) && json_results[key].best_hit){
          console.log("blast is :" + JSON.stringify(json_results));
        //}
      //}
    });
  }


  // widget configuration for drop-down-list
  //$scope.data.organismSource = { 'type' : 'json', 'data' : organisms };
  
  // callback for user selected an organism
  $scope.onOrganism = function(taintedOrganism, dontPersist) {
    // TODO: use nGSanitize to whitelist allowed strings user input
    var persist = (dontPersist == undefined) ? true : false;
    
    var organism = taintedOrganism;
    if( ! organism) { return; }

    if(organism != session.data().search.organism) {
       // other search inputs are now invalidated
       session.data().search = {};
       //$scope.data.gridOptions.data = '';
    }

    var useReferences = genomeReferences[organism];    
    $scope.data.genomeSource  = { 'type' : 'json', 'data' : useReferences };
    
    // update background image showing new organism
    $('body').css('background', 'url({{ STATIC_URL }}images/' + organism + '.jpg)');
    
    if(persist) {
      session.data().search.organism = organism;
      session.save();
    }
  };
 
  if( ! session.data().search.organism) {
    session.data().search.organism = $scope.data.organism;
  }

  //$scope.data.genomeSource = { 'type' : 'json', 'data' : genomeReferences[session.data().search.organism] };

  // callback for search form is submitted. the searchResultController will
  // handle the search job & present results.
  $scope.onSearch = function() {
    $scope.data.error = '';
    if (! session.data().search.targettype) {
      $scope.data.error = 'Please specify target type.';
      return false;
    }
    
    // copy current selections from select widgets, if ng-change did not fire
    // for these values
    if( ! session.data().search.organism) {
      session.data().search.organism = $scope.data.organism;
    }
    if( ! session.data().search.genome) {
      session.data().search.genome = $scope.data.genome;
    }
    if( ! session.data().search.dbs) {
      session.data().search.dbs = $scope.data.dbs;
    }
    session.save();
    if(session.data().search.targettype == "fasta" ){
      // Go to Search result page when search targets are fasta:
      $state.go('nav.search-result');
    } else {

    // Open JBrowse in a new tab when search targets are coords: 
    var gettar = new Get_targets.query({session: session.data().user.id},function(gettar){ 
          var promises = [];
          var jb_url   = '';
	  angular.forEach(gettar, function(val, key) {
	    var pr = new Promise(function(resolve, reject) {
		  var jb = new FormatJbrowse.query({bacsession: val.bacsession_id, region: val.coords}, function(jbrowse){
  		    jb_url = jbrowse.url;
		    resolve(jb_url);
		  });
	    });
	    promises.push(pr);
	  });

          $q.all(promises)
	  .then(function(){
            $window.open("http://" + jb_url);     	
	   });
      });
    }
  }
  
  // callback for user selected a genome
  $scope.onGenome = function(taintedGenome, dontPersist) {
    var persist = (dontPersist == undefined) ? true : false;               
    var genome = taintedGenome; // TODO sanitize user input!
    if(! genome) { return; }
    
    if(genome != session.data().search.genome) {
       // other search inputs are now invalidated
       session.data().search.dbs = null;
    }

    var useDbs = dbsDatasets[genome];
    $scope.data.dbsSource = { 'type' : 'json', 'data' : useDbs };
   if(persist) {
      // persist genome in session
      session.data().search.genome = genome;
      session.save();
    }
  };

  $scope.data.dbsSource = { 'type' : 'json', 'data' : dbsDatasets[session.data().search.genome] };

  // callback for user selected a dbs dataset
  $scope.onDbS = function(taintedDbs, dontPersist) {
    var persist = (dontPersist == undefined) ? true : false;
    var dbs = taintedDbs; // TODO sanitize user input!
    if(! dbs) { return; }
    
    // persist dbs in session
    if(persist) {
      session.data().search.dbs = dbs;
      session.save();
    }
  };

  // callback for add search target button;  mode is either 'fasta' or
  // 'coordinates'
  $scope.onSetSearchTargetMode = function(mode) {
    $scope.data.error = '';
    $scope.data.searchTargetMode = mode;
    if(! mode) {
      $scope.data.addCoords = null;
      $scope.data.addFasta = null;
    }
  };

  // restrict search targets to all fasta, or all genome coordinates. (mixed
  // target types are undefined behavior )
  $scope.allowSearchTarget = function(targetType) {    
    if( (! session.data().search) || (! session.data().search.targettype)) {
      return true; // allow either type of serch
    }
    if ( (targetType == 'coordinates') && ($scope.myData.length == 1) ) {
	return false; // do not allow search for more than one coord target
    }
    return session.data().search.targettype == targetType;    
  };

  // callback for fasta example data button
  $scope.onAddExampleFasta = function() {
    $scope.data.error = '';
    $http({method: 'GET', url: '{{ STATIC_URL }}samples/search-example.fa'}).
      success(function(data, status, headers, config) {
	$scope.data.addFasta = data;
      }).
      error(function(data, status, headers, config) {
	$scope.data.error = data;
      });
  };
 
  // callback for clearing list of search targets
  $scope.onClearTargets = function() {
    $scope.data.error = '';    
    var clear = $window.confirm('Are you absolutely sure you want to clear the targets?');   

    if (clear) {
        $scope.data.addFasta = null;
        $scope.data.addCoords = null;
        session.data().search.targettype = null;
        session.save();

        var bacsess = $resource('crud/bacsessions/:session', {session: session.data().user.id}).query({}, function(bacsess_data){

	    angular.forEach(bacsess_data, function(bacsession, key) {
                var target_id = bacsession.target_id
   	        var target = new Target({pk: target_id});
		//delete target records (all corresponding records in bac and bacsession will be deleted too):
		target.$remove();
                $scope.myData.pop();
	    });
	});
     }

     $scope.data.gridOptions = {
       data: '',
       plugins: [new ngGridFlexibleHeightPlugin()]
     };

   };

  function save_target(target) {
      var dbs        = $scope.data.dbs;
      var searchmode = $scope.data.searchTargetMode;
      $scope.data.error = '';

      var tt = Targettype.get({label: searchmode}, function(){
	  var tt_id = tt.pk;
          //new record in bacster_target:
	  session.data().search.targettype = searchmode;
	  session.save();
	  var new_target;
          if (searchmode == 'fasta') {
            var header = target.split("\n")[0];
            // limit the length of target seq to 25K:
  	    if((target.length - header.length - 1) > 25000) {
	      $scope.data.error = 'The length of your FASTA target is '+(target.length - header.length - 1)+'. Please make sure the target sequence does not exceed 25K.';
              return false;
	    }
            var found = false;
	    var pr = new Promise(
  	      function(resolve, reject) {
                var gettar = new Get_targets.query({session: session.data().user.id},function(gettar){
                  angular.forEach(gettar, function(val, key) {
                    if (header == val.seq.split("\n")[0]) {
                      found = true;
                      resolve(found);
       	            }
                  });
                });
              }
            );
            // make sure the header is unique (per sission):           
            pr.then(function(){
	      if (found) {
		$scope.data.error = 'You have already added a FASTA target with a header '+header+'. A header must be unique.';
		return false;
	      }
	    });

            new_target = new Target({seq: target, coords: "-", targettype: tt_id});
	  } else {
	      new_target = new Target({seq: "-", coords: target, targettype: tt_id});
          }
	  new_target.$save(function(){
              //new record in bacster_bac:
	      var new_bac = new Bac({bacset: dbs, target: new_target.pk});
              new_bac.$save(function(){
                  //new record in bacster_bacsession:
                  var new_bacsession = new Bacsession({bac: new_bac.pk, session: session.data().user.id});
                  new_bacsession.$save(function(){
		    $scope.myData.push({ 'target' : target, 'search type' : searchmode});
                  });
              });
          });
      });

      $scope.data.gridOptions = {
	  data: 'myData',
	  plugins: [new ngGridFlexibleHeightPlugin()]
      };
  }



  // callback for add coordinates search target
  $scope.onAddCoordsData = function(coordinates) {
    $scope.data.error = '';
    save_target(coordinates);

    // this stays:
    $scope.onSetSearchTargetMode(null);
  };

   // callback for add fasta search target
  $scope.onAddFastaData = function(fasta) {
    $scope.data.error = '';
    save_target(fasta);
  
    //this stays:
    $scope.onSetSearchTargetMode(null);    

  };
  
  // restore the user''s selection for organism
  $scope.data.organism = session.data().search.organism;
  if($scope.data.organism) {
     $scope.onOrganism($scope.data.organism, true);
  }
  
  // restore user''s selection for genome
  $scope.data.genome = session.data().search.genome;
  if($scope.data.genome) {
    $scope.onGenome($scope.data.genome, true);
  }
  
  // restore user''s selection for dbs
  $scope.data.dbs = session.data().search.dbs;
  if($scope.data.dbs) {
    $scope.onDbS($scope.data.dbs, true);
  }

  $scope.onUploadFileFasta= function(){
    $scope.data.error = '';
   
    var f = document.getElementById('file').files[0],
    r = new FileReader();
    if (! f) {
      $scope.data.error = 'No file has been selected. Please select a file.';
      return false;
    }

    r.onloadend = function(e){   
  
      //get the data via $http:   
      $http({method: 'GET', url: e.target.result}).
        success(function(filedata) {
          $scope.data.addFasta = filedata;
        }).
	error(function(filedata) {
          $scope.data.addFasta = filedata || "Request failed";
        });  
    }

    //The target.result property will contain the file''s data encoded as a data URL:
    r.readAsDataURL(f); 
  }
});
