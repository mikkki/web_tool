/*
 * searchController
 *
 * Enable user interaction in nav.search ui state
 */
app.controller('searchController', function($scope, $state, $http, $resource, $cookieStore, $window, $route, $q,
					    FormatJbrowse, Session, Organism, Genome, Bacset, Target, Targettype, Bac, Bacsession, Get_targets, session, workLog) {

  if(! session.data().user) {  
    $state.go('nav.new-session');
  }
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
  $scope.data.organismSource = [];

  var pr1 = new Promise(function(resolve, reject){
    var o = Organism.query({}, function(){
      $scope.data.organismSource =  o;
    });
    resolve($scope.data.organismSource);
  });

  /*
   * genomes
   */

  $scope.data.genomeSource = [];
  $scope.genomes           = {};

  var pr2 = new Promise(function(resolve, reject){
    var g = Genome.query({}, function(){
      angular.forEach(g, function(genome, key) {
          if (this[genome.organism]) {
              this[genome.organism].push({ 'genomeName' : genome.label, 'id' : genome.pk});
          } else {
              this[genome.organism] = [{ 'genomeName' : genome.label, 'id' : genome.pk}];
          }
          if(! $scope.genomes[genome.organism]) {
	
            $scope.genomes[genome.organism] = {};

            //default chr name is used in the 'Example data':
            $scope.genomes[genome.organism]['default'] = genome.label; 
	  } 

          //maps chr name to chr len:
          $scope.genomes[genome.organism][genome.label] = genome.len;

          if (! $scope.genomes[genome.organism]['labels']) {
            // contains a list of all valid chr names for the given ref/organism:
            $scope.genomes[genome.organism]['labels'] = [];      
          }

          $scope.genomes[genome.organism]['labels'].push(genome.label);

          //$scope.genomes[genome.organism][genome.pk]['label'] = genome.label;                     
          //$scope.genomes[genome.organism][genome.pk]['len'] = genome.len;

      }, $scope.data.genomeSource);
    });
    resolve($scope.data.genomeSource);
  });

  /*
   * DbS datasets
   */

  $scope.data.dbsSource = [];

  var pr3 = new Promise(function(resolve, reject){
    var bs = Bacset.query({}, function(){
      angular.forEach(bs, function(bacset, key) {
          //this refers to a $scope.data.dbsSource elem
          if (this[bacset.organism]) {
            this[bacset.organism].push({ 'name' : bacset.label, 'id' : bacset.pk});
  	  } else {
	    this[bacset.organism] = [{ 'name' : bacset.label, 'id' : bacset.pk}];  
          }
      }, $scope.data.dbsSource);
    });
    resolve($scope.data.dbsSource);
  });

  var init_promises = [];
  init_promises.push(pr1, pr2, pr3);

  $q.all(init_promises).then(function() {
      if( ! session.data().search.organism) {
          session.data().search.organism = $scope.data.organism;
      }
      session.save();           
  }).then(function(dbs) {
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
  //$scope.data.organismSource = organisms ;
  
  // callback for user selected an organism
  $scope.onOrganism = function(taintedOrganism, dontPersist) {

    var persist = (dontPersist == undefined) ? true : false;
    
    var organism = taintedOrganism;
    if( ! organism) { return; }

    if(organism != session.data().search.organism) {
       // other search inputs are now invalidated
       session.data().search = {};
       //$scope.data.gridOptions.data = '';
    }
   
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
	    //setTimeout(function(){
            $window.open("http://" + jb_url);
            //}, 5000);           
	  });
      });
    }
  }

  // callback for user selected a genome - not used!
  $scope.onGenome = function(taintedGenome, dontPersist) {
    var persist = (dontPersist == undefined) ? true : false;               
    var genome = taintedGenome; // TODO sanitize user input!
    if(! genome) { return; }
    
    if(genome != session.data().search.genome) {
       // other search inputs are now invalidated
       session.data().search.dbs = null;
    }

   if(persist) {
      // persist genome in session
      session.data().search.genome = genome;
      session.save();
    }
  };

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
  $scope.onSetSearchTargetMode = function(mode, keep_errors) {
    // clear the error messages unless explicitly instructed not to by passing 'keep_errors' argument:
    if(! keep_errors) {
      $scope.data.error = '';
    }
    $scope.data.searchTargetMode = mode;

    if(! mode) {
      $scope.data.addCoords = null;
      $scope.data.addFasta = null;
    }
    // when a target has been cancelled and there are no other targets previously added, unset the search.targettype:
    if($scope.myData.length == 0) {
      session.data().search.targettype = null;
      session.save();
    }
  };

  // restrict search targets to all fasta, or all genome coordinates. (mixed
  // target types are undefined behavior )
  $scope.allowSearchTarget = function(targetType) {
    if ((! session.data()) || (! session.data().search) || (! session.data().search.targettype)) {
	return true;
    }    

    if ((! session.data().search.organism) || (! session.data().search.dbs)) {
	return false; // do not allow search in case when organism, genome or dbs are not set
    }

    if ($scope.myData.length == 1)  {
	return false; // do not allow search for more than one target
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
	$scope.onSetSearchTargetMode(null);
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

  // method for adding individual target to the db and the grid:
  function add_tar(new_target, dbs, target, searchmode) {
      if (new_target) {
	  new_target.$save(function(){
              //new record in bacster_bac:
              var new_bac = new Bac({bacset: dbs, target: new_target.pk});
              new_bac.$save(function(){
                  //new record in bacster_bacsession:
                  var new_bacsession = new Bacsession({bac: new_bac.pk, session: session.data().user.id});
                  new_bacsession.$save(function(){
                      //add target to the grid:
		      $scope.myData.push({ 'target' : target, 'search type' : searchmode});
                  });
              });
	  });
      }
  }

  // method that does some preliminary tasks and calls add_tar():  
  function save_target(target) {
      var dbs        = $scope.data.dbs;
      var searchmode = $scope.data.searchTargetMode;

      console.log("dbs  " + $scope.data.dbs);
      var tt = Targettype.get({label: searchmode}, function(){
	  $scope.tt_id = tt.pk;
          //new record in bacster_target:
	  session.data().search.targettype = searchmode;
	  session.save();
	  var new_target;

          if (searchmode == 'fasta') {
            //fasta target:
            new_target = new Target({seq: target, coords: "-", targettype: $scope.tt_id});
	  } else { 
            //coord target:
	    new_target = new Target({seq: "-", coords: target, targettype: $scope.tt_id}); 	
          }

          add_tar(new_target, dbs, target, searchmode);
      });

      $scope.data.gridOptions = {
	  data: 'myData',
	  plugins: [new ngGridFlexibleHeightPlugin()]
      };
  }

  // method that validates & sanitizes the user input for coord target:
  function validate_coords(target) {
      target = target.trim().replace(/,/g, '').replace(/\s/g, '').replace(/\.\./, '-');
      var chr = target.split(":")[0];
      var end = target.split("-")[1];
      var valid_chrs = $scope.genomes[$scope.data.organism]['labels'];
      $scope.data.error = '';

      //check if the chr name is valid in the context of the selected ref/organism:
      if(valid_chrs.indexOf(chr) === -1) {
          $scope.data.error = 'You have entered a chromosome name "'+chr+'" which is not valid in the context of the selected Reference.';
          return false;
      } else if(end > $scope.genomes[$scope.data.organism][chr]){   //check if the end coord is greater than the length of the chromosome:
          $scope.data.error = 'You have entered an "end" coordinate ' + end +' which exceeds the length of ' + chr + '. \
          The length of ' + chr + ' is '+ $scope.genomes[$scope.data.organism][chr] +'.';
          return false;
      } else {
	  return target;  
      } 
  }

  // method that validates & sanitizes the user input for fasta targets:
  function validate_fasta(fasta) {
      //split fasta data into multiple fasta targets:
      var fasta_targets = fasta.split("\n>");
      var added_tars = [];
      var errors = [];
      $scope.data.error = '';
      angular.forEach(fasta_targets, function(fasta_target, index) {

          // prepend ">" which was trimmed during the split to the fasta target:
	  if (! fasta_target.trim().match(/^>/)) {
	      fasta_target = ">" + fasta_target.trim();
	  }
	  var header = fasta_target.split("\n")[0];
          var seq    = fasta_target.split(header)[1];
	  var regExp = new RegExp(header, "gi");
	  var count = (fasta.match(regExp) || []).length;
          var open_p = "<p>";
          var close_p = "</p>";

          // fasta sequence must be valid:
          var msg = "FASTA sequence "+header+" is not valid.";
          msg     = open_p + msg + close_p;
	  if ( (! seq.trim().match(/^[a-zA-Z\n]+$/)) && (errors.indexOf(msg) == -1) ) {
	      this.push(msg);
          }

          // fasta header must be valid:
	  var msg = "FASTA header "+header+" is not valid.";
	  msg     = open_p + msg + close_p;
	  if ( (! header.trim().match(/^>[^<>]+$/)) && (errors.indexOf(msg) == -1) ) {
              this.push(msg);
          }
 
          // header must be unique:
          var msg = "You have added multiple FASTA targets with a header "+header+". A header must be unique.";
          msg     = open_p + msg + close_p;
	  if ((count > 1) && (errors.indexOf(msg) == -1)) {            
	    this.push(msg);
          }

          // fasta length must be < 25K:
          msg = "The length of your FASTA target "+header+" is "+ (fasta_target.length - header.length - 1)+". Please make sure the target sequence does not exceed 25K.";
          msg   = open_p + msg + close_p;
	  if ( ((fasta_target.length - header.length - 1) > 25000) && (errors.indexOf(msg) == -1) ) {
	    this.push(msg);
	  }   
          added_tars.push(fasta_target);
      }, errors);

      if (errors.length) {
          $scope.data.error = errors.join('');
          console.log("then function -  data.error: " +errors.length + " ; "  + $scope.data.error);
          return false;
      } else {
          return added_tars;
      }
  }

  // callback for add coordinates search target
  $scope.onAddCoordsData = function(coordinates) {

    if (validate_coords(coordinates)) {
        save_target(validate_coords(coordinates));
    }
    $scope.onSetSearchTargetMode(null);
  };

  // callback for add fasta search target
  $scope.onAddFastaData = function(fasta) {

    if (validate_fasta(fasta)) {
      angular.forEach(validate_fasta(fasta), function(fasta_target, index) {      
        save_target(fasta_target);
      });
    } 
    $scope.onSetSearchTargetMode(null, 1);    
  };
  
  // restore the user''s selection for organism
  $scope.data.organism = session.data().search.organism;
  if($scope.data.organism) {
     $scope.onOrganism($scope.data.organism, true);
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
