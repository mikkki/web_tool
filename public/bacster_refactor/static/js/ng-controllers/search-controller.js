/*
 * searchController
 *
 * Enable user interaction in nav.search ui state
 */
app.controller('searchController', function($scope, $state, $http, $resource, $cookieStore,
					    Session, Session_pid, Organism, Genome, Bacset, Target, Targettype, Bac, Bacsession, session, workLog) {

  /******** TESTING BOF **********/
  // Getting the current Session object
  var test = new Session_pid('crud/sessioninfo_pid/' + session.data().user.pioneerId).query(function(data){
        //console.log("test get stuff: " + JSON.stringify(data));
  });

  var sess = $resource('crud/sessioninfo/', {"pk": "@pk"});
   
  console.log("my session.user.id: " + JSON.stringify(session.data().user.id));

  var s = sess.get({pk: session.data().user.id}, function(){
      //console.log("my database session: " + JSON.stringify(s));  
      //console.log("my scope session: " + JSON.stringify($scope.session));
      //console.log("cookie store: " + JSON.stringify($cookieStore.get('bacster-session')));
  });
  /******** TESTING EOF**********/


  // make session available in the view''s scope
  $scope.session = session;

  // start a hash for search info in session, if it doesn''t exist yet
  if( ! session.data().search ) {
    session.data().search = { targets : [] };
  }

  // it is recommended for ng-model to have a "dot" e.g. $scope.data.whatever
  if(! $scope.data) {
    $scope.data = {};
  }

  $scope.data.gridOptions = {
    data: 'session.data().search.targets',
    plugins: [new ngGridFlexibleHeightPlugin()]
  };
  
  /*
   * organisms 
   */

  // the available organisms loaded from the database:
  $scope.data.organismSource = {};
  var o = Organism.query({}, function(){
      $scope.data.organismSource = { 'type' : 'json', 'data' : o };
  });

  /*
   * genomes
   */

  var genomeReferences = {};
  var g = Genome.query({}, function(){
      angular.forEach(g, function(genome, key) {
          if (this[genome.organism]) {
              this[genome.organism].push({ 'genomeName' : genome.label, 'id' : genome.pk});
          } else {
              this[genome.organism] = [{ 'genomeName' : genome.label, 'id' : genome.pk}];
          }
      }, genomeReferences);
  });


  /*
   * DbS datasets
   */

  var dbsDatasets = {};
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

  //calls blast on server side EDIT this later target does nothing, nav.search
  $scope.BlastTargets = function(target){
    console.log("my target is: " + target);
    var blast = $resource('crud/blast_targets', {}, {'query':  {method:'GET', isArray:false}});
    var json_results = blast.query({}, function(){
      for (var key in json_results){
        if (json_results.hasOwnProperty(key) && json_results[key].best_hit){
          console.log("blast is :" + JSON.stringify(json_results) + "\t" + key + "\t" + JSON.stringify(json_results[key].best_hit));
        }
      }
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
 
  $scope.data.genomeSource = { 'type' : 'json', 'data' : [] };

  // callback for search form is submitted. the searchResultController will
  // handle the search job & present results.
  $scope.search = function() {

    if(session.data().search.targets.length == 0) {
      $scope.data.error = 'Please add search targets';
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
    $state.go('nav.search-result');
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
  
  $scope.data.dbsSource = { 'type' : 'json', 'data' : [] };
  
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
    $scope.data.searchTargetMode = mode;
    if(! mode) {
      $scope.data.addCoords = null;
      $scope.data.addFasta = null;
    }
  };

  // restrict search targets to all fasta, or all genome coordinates. (mixed
  // target types are undefined behavior )
  $scope.allowSearchTarget = function(targetType) {
    var targets = session.data().search.targets;
    if( ! targets || targets.length == 0 ) {
      return true; // allow either type of serch
    }
    return targets[0]['search type'] == targetType;
  };

  // callback for fasta example data button
  $scope.onAddExampleFasta = function() {
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
    $scope.data.addFasta = null;
    $scope.data.addCoords = null;
    
    session.data().search.targets = [];
    session.save();
  };
  
  // callback for add coordinates search target
  $scope.onAddCoordsData = function(coordinates) {
    if(! session.data().search.targets) {
      session.data().search.targets = [];
    }
    $scope.session.data().search.targets.push( {
      'target' : coordinates,
      'search type' : 'coordinates'
    });
    $scope.session.save();    
    $scope.onSetSearchTargetMode(null);
  };

   // callback for add fasta search target
  $scope.onAddFastaData = function(fasta) {

    //var organism = $scope.data.organism;
    //var genome   = $scope.data.genome;
    var dbs      = $scope.data.dbs;
    var searchmode = $scope.data.searchTargetMode;

    var tt = Targettype.get({label: searchmode}, function(){
      tt_id = tt.pk;
      //new record in bacster_target:
      var new_target = new Target({seq: fasta, coords: "-", targettype: tt_id});
      new_target.$save(function(){
        //new record in bacster_bac:
        var new_bac = new Bac({bacset: dbs, target: new_target.pk});
        new_bac.$save(function(){
          //new record in bacster_bacsession:
          var new_bacsession = new Bacsession({bac: new_bac.pk, session: session.data().user.id});
          new_bacsession.$save(function(){
          });
        });
      });
    });
 
    
    if(! session.data().search.targets) {
      session.data().search.targets = [];
    }
    $scope.session.data().search.targets.push( {
      'target' : fasta,
      'search type' : 'fasta'
    });
    $scope.session.save();
    
    //this stays:
    $scope.onSetSearchTargetMode(null);    

  };
  
  // restore the user's selection for organism
  $scope.organism = session.data().search.organism;
  if($scope.data.organism) {
     $scope.onOrganism($scope.data.organism, true);
  }
  
  // restore user's selection for genome
  $scope.data.genome = session.data().search.genome;
  if($scope.data.genome) {
    $scope.onGenome($scope.data.genome, true);
  }
  
  // restore user''s selection for dbs
  $scope.data.dbs = session.data().search.dbs;
  if($scope.data.dbs) {
    $scope.onDbS($scope.data.dbs, true);
  }

  $scope.onUploadFileFasta = function(){
    var f = document.getElementById('file').files[0],
    r = new FileReader();
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
