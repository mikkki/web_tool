/*!
FileReader.js - v0.99
A lightweight wrapper for common FileReader usage.
Copyright 2014 Brian Grinstead - MIT License.
See http://github.com/bgrins/filereader.js for documentation.
*/

(function(window, document) {

    var FileReader = window.FileReader;
    var FileReaderSyncSupport = false;
    var workerScript = "self.addEventListener('message', function(e) { var data=e.data; try { var reader = new FileReaderSync; postMessage({ result: reader[data.readAs](data.file), extra: data.extra, file: data.file})} catch(e){ postMessage({ result:'error', extra:data.extra, file:data.file}); } }, false);";
    var syncDetectionScript = "onmessage = function(e) { postMessage(!!FileReaderSync); };";
    var fileReaderEvents = ['loadstart', 'progress', 'load', 'abort', 'error', 'loadend'];
    var sync = false;
    var FileReaderJS = window.FileReaderJS = {
        enabled: false,
        setupInput: setupInput,
        setupDrop: setupDrop,
        setupClipboard: setupClipboard,
        setSync: function (value) {
            sync = value;

            if (sync && !FileReaderSyncSupport) {
                checkFileReaderSyncSupport();
            }
        },
        getSync: function() {
            return sync && FileReaderSyncSupport;
        },
        output: [],
        opts: {
            dragClass: "drag",
            accept: false,
            readAsDefault: 'DataURL',
            readAsMap: {
            },
            on: {
                loadstart: noop,
                progress: noop,
                load: noop,
                abort: noop,
                error: noop,
                loadend: noop,
                skip: noop,
                groupstart: noop,
                groupend: noop,
                beforestart: noop
            }
        }
    };

    // Setup jQuery plugin (if available)
    if (typeof(jQuery) !== "undefined") {
        jQuery.fn.fileReaderJS = function(opts) {
            return this.each(function() {
                if (jQuery(this).is("input")) {
                    setupInput(this, opts);
                }
                else {
                    setupDrop(this, opts);
                }
            });
        };

        jQuery.fn.fileClipboard = function(opts) {
            return this.each(function() {
                setupClipboard(this, opts);
            });
        };
    }

    // Not all browsers support the FileReader interface. Return with the enabled bit = false.
    if (!FileReader) {
        return;
    }


    // makeWorker is a little wrapper for generating web workers from strings
    function makeWorker(script) {
        var URL = window.URL || window.webkitURL;
        var Blob = window.Blob;
        var Worker = window.Worker;

        if (!URL || !Blob || !Worker || !script) {
            return null;
        }

        var blob = new Blob([script]);
        var worker = new Worker(URL.createObjectURL(blob));
        return worker;
    }

    // setupClipboard: bind to clipboard events (intended for document.body)
    function setupClipboard(element, opts) {

        if (!FileReaderJS.enabled) {
            return;
        }
        var instanceOptions = extend(extend({}, FileReaderJS.opts), opts);

        element.addEventListener("paste", onpaste, false);

        function onpaste(e) {
            var files = [];
            var clipboardData = e.clipboardData || {};
            var items = clipboardData.items || [];

            for (var i = 0; i < items.length; i++) {
                var file = items[i].getAsFile();

                if (file) {

                    // Create a fake file name for images from clipboard, since this data doesn't get sent
                    var matches = new RegExp("/\(.*\)").exec(file.type);
                    if (!file.name && matches) {
                        var extension = matches[1];
                        file.name = "clipboard" + i + "." + extension;
                    }

                    files.push(file);
                }
            }

            if (files.length) {
                processFileList(e, files, instanceOptions);
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    // setupInput: bind the 'change' event to an input[type=file]
    function setupInput(input, opts) {

        if (!FileReaderJS.enabled) {
            return;
        }
        var instanceOptions = extend(extend({}, FileReaderJS.opts), opts);

        input.addEventListener("change", inputChange, false);
        input.addEventListener("drop", inputDrop, false);

        function inputChange(e) {
            processFileList(e, input.files, instanceOptions);
        }

        function inputDrop(e) {
            e.stopPropagation();
            e.preventDefault();
            processFileList(e, e.dataTransfer.files, instanceOptions);
        }
    }

    // setupDrop: bind the 'drop' event for a DOM element
    function setupDrop(dropbox, opts) {

        if (!FileReaderJS.enabled) {
            return;
        }
        var instanceOptions = extend(extend({}, FileReaderJS.opts), opts);
        var dragClass = instanceOptions.dragClass;
        var initializedOnBody = false;

        // Bind drag events to the dropbox to add the class while dragging, and accept the drop data transfer.
        dropbox.addEventListener("dragenter", onlyWithFiles(dragenter), false);
        dropbox.addEventListener("dragleave", onlyWithFiles(dragleave), false);
        dropbox.addEventListener("dragover", onlyWithFiles(dragover), false);
        dropbox.addEventListener("drop", onlyWithFiles(drop), false);

        // Bind to body to prevent the dropbox events from firing when it was initialized on the page.
        document.body.addEventListener("dragstart", bodydragstart, true);
        document.body.addEventListener("dragend", bodydragend, true);
        document.body.addEventListener("drop", bodydrop, false);

        function bodydragend(e) {
            initializedOnBody = false;
        }

        function bodydragstart(e) {
            initializedOnBody = true;
        }

        function bodydrop(e) {
            if (e.dataTransfer.files && e.dataTransfer.files.length ){
                e.stopPropagation();
                e.preventDefault();
            }
        }

        function onlyWithFiles(fn) {
            return function() {
                if (!initializedOnBody) {
                    fn.apply(this, arguments);
                }
            };
        }

        function drop(e) {
            e.stopPropagation();
            e.preventDefault();
            if (dragClass) {
                removeClass(dropbox, dragClass);
            }
            processFileList(e, e.dataTransfer.files, instanceOptions);
        }

        function dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
            if (dragClass) {
                addClass(dropbox, dragClass);
            }
        }

        function dragleave(e) {
            if (dragClass) {
                removeClass(dropbox, dragClass);
            }
        }

        function dragover(e) {
            e.stopPropagation();
            e.preventDefault();
            if (dragClass) {
                addClass(dropbox, dragClass);
            }
        }
    }

    // setupCustomFileProperties: modify the file object with extra properties
    function setupCustomFileProperties(files, groupID) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            file.extra = {
                nameNoExtension: file.name.substring(0, file.name.lastIndexOf('.')),
                extension: file.name.substring(file.name.lastIndexOf('.') + 1),
                fileID: i,
                uniqueID: getUniqueID(),
                groupID: groupID,
                prettySize: prettySize(file.size)
            };
        }
    }

    // getReadAsMethod: return method name for 'readAs*' - http://www.w3.org/TR/FileAPI/#reading-a-file
    function getReadAsMethod(type, readAsMap, readAsDefault) {
        for (var r in readAsMap) {
            if (type.match(new RegExp(r))) {
                return 'readAs' + readAsMap[r];
            }
        }
        return 'readAs' + readAsDefault;
    }

    // processFileList: read the files with FileReader, send off custom events.
    function processFileList(e, files, opts) {

        var filesLeft = files.length;
        var group = {
            groupID: getGroupID(),
            files: files,
            started: new Date()
        };

        function groupEnd() {
            group.ended = new Date();
            opts.on.groupend(group);
        }

        function groupFileDone() {
            if (--filesLeft === 0) {
                groupEnd();
            }
        }

        FileReaderJS.output.push(group);
        setupCustomFileProperties(files, group.groupID);

        opts.on.groupstart(group);

        // No files in group - end immediately
        if (!files.length) {
            groupEnd();
            return;
        }

        var supportsSync = sync && FileReaderSyncSupport;
        var syncWorker;

        // Only initialize the synchronous worker if the option is enabled - to prevent the overhead
        if (supportsSync) {
            syncWorker = makeWorker(workerScript);
            syncWorker.onmessage = function(e) {
                var file = e.data.file;
                var result = e.data.result;

                // Workers seem to lose the custom property on the file object.
                if (!file.extra) {
                    file.extra = e.data.extra;
                }

                file.extra.ended = new Date();

                // Call error or load event depending on success of the read from the worker.
                opts.on[result === "error" ? "error" : "load"]({ target: { result: result } }, file);
                groupFileDone();
            };
        }

        Array.prototype.forEach.call(files, function(file) {

            file.extra.started = new Date();

            if (opts.accept && !file.type.match(new RegExp(opts.accept))) {
                opts.on.skip(file);
                groupFileDone();
                return;
            }

            if (opts.on.beforestart(file) === false) {
                opts.on.skip(file);
                groupFileDone();
                return;
            }

            var readAs = getReadAsMethod(file.type, opts.readAsMap, opts.readAsDefault);

            if (syncWorker) {
                syncWorker.postMessage({
                    file: file,
                    extra: file.extra,
                    readAs: readAs
                });
            }
            else {

                var reader = new FileReader();
                reader.originalEvent = e;

                fileReaderEvents.forEach(function(eventName) {
                    reader['on' + eventName] = function(e) {
                        if (eventName == 'load' || eventName == 'error') {
                            file.extra.ended = new Date();
                        }
                        opts.on[eventName](e, file);
                        if (eventName == 'loadend') {
                            groupFileDone();
                        }
                    };
                });
                reader[readAs](file);
            }
        });
    }

    // checkFileReaderSyncSupport: Create a temporary worker and see if FileReaderSync exists
    function checkFileReaderSyncSupport() {
        var worker = makeWorker(syncDetectionScript);
        if (worker) {
            worker.onmessage =function(e) {
                FileReaderSyncSupport = e.data;
            };
            worker.postMessage({});
        }
    }

    // noop: do nothing
    function noop() {

    }

    // extend: used to make deep copies of options object
    function extend(destination, source) {
        for (var property in source) {
            if (source[property] && source[property].constructor &&
                source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                arguments.callee(destination[property], source[property]);
            }
            else {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    // hasClass: does an element have the css class?
    function hasClass(el, name) {
        return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(el.className);
    }

    // addClass: add the css class for the element.
    function addClass(el, name) {
        if (!hasClass(el, name)) {
          el.className = el.className ? [el.className, name].join(' ') : name;
        }
    }

    // removeClass: remove the css class from the element.
    function removeClass(el, name) {
        if (hasClass(el, name)) {
          var c = el.className;
          el.className = c.replace(new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), " ").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }
    }

    // prettySize: convert bytes to a more readable string.
    function prettySize(bytes) {
        var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'];
        var e = Math.floor(Math.log(bytes)/Math.log(1024));
        return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+s[e];
    }

    // getGroupID: generate a unique int ID for groups.
    var getGroupID = (function(id) {
        return function() {
            return id++;
        };
    })(0);

    // getUniqueID: generate a unique int ID for files
    var getUniqueID = (function(id) {
        return function() {
            return id++;
        };
    })(0);

    // The interface is supported, bind the FileReaderJS callbacks
    FileReaderJS.enabled = true;

})(this, document);
// instantiate angular-js web app named bacster

var app = angular.module('bacster', ['ui.router', 'kendo.directives',
				      'ngCookies', 'ngGrid', 'ngResource']);

app.config( function($httpProvider, $stateProvider, $urlRouterProvider) {
  /* Create url routes, and a root ui state named 'nav'. All other ui
   * states are declared to be children of nav. Nav state partials
   * will get loaded into the template nav.html.
   */
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  $stateProvider
    .state('nav', {
      url: '/',
      templateUrl: '/static/partials/nav.html',
      controller : 'navController'
    })
    .state('nav.home', {
      url: 'home',
      templateUrl: '/static/partials/nav.home.html',
      controller: 'homeController'
    })
    .state('nav.search', {
      url: 'search',
      templateUrl: '/static/partials/nav.search.html',
      controller: 'searchController'
    })
    .state('nav.search-result', {
      url: 'search/result',
      templateUrl: '/static/partials/nav.search-result.html',
      controller: 'searchResultController'
    })
    .state('nav.collection', {
      url: 'collection', 
      templateUrl: '/static/partials/nav.collection.html',
      controller: 'collectionController'
    })
    .state('nav.form-generate', {
      url: 'form-generate',
      templateUrl: '/static/partials/nav.form-generate.html'
    })
    .state('nav.help', {
      url: 'help',
      templateUrl: '/static/partials/nav.help.html'
    })
    .state('nav.about', {
      url: 'about',
      templateUrl: '/static/partials/nav.about.html'
    })
    .state('nav.new-session', {
      url: 'new-session',
      templateUrl: '/static/partials/nav.new-session.html',
      controller: 'sessionController'
    })  
    .state('nav.logs', {
      url: 'logs',
      templateUrl: '/static/partials/nav.logs.html',
      controller : 'workLogController'
    });
    
  // for any unmatched url, redirect to /home
  $urlRouterProvider.otherwise('/home');
  
});


// do some work when the app is started
app.run( function ($rootScope, $state, $stateParams) {
  
  /* 
   * It''s very handy to add references to $state and $stateParams to the
   * $rootScope so that you can access them from any scope within your
   * applications.For example, <li ng-class="{ active:
   * $state.includes('contacts.list') }"> will set the <li> to active
   * whenever'contacts.list' or one of its decendents is active.
   */
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
});

app.run(
    function($http, $cookies) {
        $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
        // Add the following two lines
        $http.defaults.xsrfCookieName = 'csrftoken';
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
    });

/* 
 * session service. the purpose of this service is persistence of
 * session data, in a manner accessable by any angular contoller.
 */

app.factory('Session', ['$resource', function($resource) {
	return $resource('/crud/sessioninfo.json', {pk:'@pk'});  
}]);

app.factory('mySession', ['$resource', function($resource) {
    return $resource('crud/sessioninfo/:pk.json', { pk: '@pk' }, {
      update: {
	method: 'PUT'
	}
    });
}]);

app.factory('session', function($state, $cookieStore, Session) {

  // TODO: refactor to store session data in db on server instead of
  // in the cookieStore service. Because 1) cookies store has a max of
  // 4096 bytes and 2) cookies are not secure form of storage.

  var cid = 'bacster-session'; // cookie id
  var data = $cookieStore.get(cid) || {};
  
  // create an return the session service
  var sessionSingleton = {
    'cookie-id' : cid,

    // callback for initalizing a new session
    'newSession' :  function() {
      data = {};
      $cookieStore.remove(cid);
      // use ui-router to redirect to new session form      
      $state.go('nav.new-session');
    },
    'save' : function() {
      // store to DB instead !
      $cookieStore.put(cid, data);
    },
    'data' : function() {
      
      return data;
    }
  };
  return sessionSingleton;
});


/* 
 * workLog service 
 *
 * the purpose of this service is to make available to any angular
 * controller, a workLog for recording interactions with the system,
 * for review by management, or by other users.
 */
app.factory('workLog', function(session) {

   // TODO: refactor to store log data on db server instead of in
  // session variable. the worklog should be a permanent record, and
  // so not associated with a particular session!
  
  // create and return the service
  var workLogSingleton = {
    'addLog' :  function(pioneerId, descr, callbackURL) {
      if( ! session.data.workLogs ) {
        session.data.workLogs = [];
      }
      session.data.workLogs.unshift({
        pioneerId : pioneerId,
        descr : descr,
        callbackURL : callbackURL
      });
      session.save();
    },
    'allLogs' : function() {
      return session.data.workLogs;
    }
  };
  return workLogSingleton;
});

/* 
 * homeController
 *
 * Any user interaction in nav.home could be added to this controller.
 */
app.controller('homeController', function($scope, $state, session) {

  // make session available in the view's scope
  $scope.session = session;
  
});


/*
 * navController
 *
 * Any user interaction with the site nav, not already implemented by
 * ui-router.  could be added to this controller. There are several
 * ways to implement navigation without adding any code to this
 * controller. See docs @ http://angular-ui.github.io/ui-router/site
 */
app.controller('navController', function($scope, $state, session) {

  // make session available in the view's scope
  $scope.session = session;

});

/*
 * sessionController
 *
 * Enable user interaction on the nav.session ui state.
 */
app.controller('sessionController_new', ['$scope', 'Session', function($scope, Session) {
    //Query returns an array of objects, MyModel.objects.all() by default
    $scope.models = Session.query();
    // a model for data binding
    $scope.user = {
      pioneerId : '',
      notes : ''
    };

  // callback to start a new session
    $scope.startSession = function() {
      var new_session = new Session({pioneer_id: $scope.user.pioneerId, notes: $scope.user.notes});
      new_session.$save(function(){
	  $scope.models.push(new_session);
      }); // In callback we push our new object to the models array

      $state.go('nav.home');
  };
}]);

app.controller('sessionController', ['$scope', 'Session', '$state', 'session', function($scope, Session, $state, session) {

  //Query returns an array of objects, MyModel.objects.all() by default
  $scope.models = Session.query();

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

    var new_session = new Session({pioneer_id: $scope.user.pioneerId, notes: $scope.user.notes});
    new_session.$save(function(){
	$scope.models.push(new_session);
    }); // In callback we push our new object to the models array
  
    // use the ui-router service to redirect user to home now that a
    // session is established
    $state.go('nav.home');
  };
}]);

/*
 * searchController
 *
 * Enable user interaction in nav.search ui state
 */
app.controller('searchController', function($scope, $state, $http, $resource,
					    Session, session, workLog) {

  // make session available in the view''s scope
  $scope.session = session;
  //$scope.models = Session.query(); // array
  var entry = Session.query({notes: 'adfsa'});
  console.log("entry: " +JSON.stringify(entry));

  // Getting the current Session object
  //var sess = $resource('crud/sessioninfo/:pk.json', {}, {query: {method:'GET', params:{pk:5}, isArray:false} });
  //var s = sess.query(function(){
  //    console.log("my database session: " + s[0].id);  
  //});

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
  // the available organisms todo: convert to ajax call to server
  var organisms =  [{
    'commonName' : 'Corn (zea mays)',
    'id' : 'zeama'
  }, {
    'commonName' : 'Soybean (glycine max)',
    'id' : 'glyma'
  }];

  // lookup tables for reference genome data and available BAC libraries
  // TODO: convert to ajax calls to server
  var genomeReferences = {
    'zeama' : [{
      'genomeName' : 'ZmChr0v2',
      'id' : 'ZmChr0v2'
    }],
    'glyma' :[{
      'genomeName' : 'Gmax_275_Wm82.a2.v1',
      'id' : 'Gmax_275_Wm82.a2.v1'
    }]
  };
  var dbsDatasets = {
    'ZmChr0v2' :  [{
      'name' : 'HC69.BACs',
      'id' : 'HC69.BACs'
    }, {
      'name' : 'HG11.BACs',
      'id' : 'HG11.BACs'
    }],
    'Gmax_275_Wm82.a2.v1' : []
  };

  // widget configuration for drop-down-list
  $scope.data.organismSource = { 'type' : 'json', 'data' : organisms };
  
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
    $('body').css('background', 'url(/static/images/' + organism + '.jpg)');
    
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
    $http({method: 'GET', url: '/static/samples/search-example.fa'}).
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
    if(! session.data().search.targets) {
      session.data().search.targets = [];
    }
    $scope.session.data().search.targets.push( {
      'target' : fasta,
      'search type' : 'fasta'
    });
    $scope.session.save();
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

/*
 * searchResultController
 *
 * Enable user interaction in nav.search-result ui state. The user's
 * search targets are in session.data().search.targets[]. Use $http
 * service to start search job, the display results.
 */
app.controller('searchResultController', function($scope, $state, $http,
  session, workLog) {
  
  // make session available in the view's scope
  $scope.session = session;
  
});

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

/*
 * workLogController 
 *
 * Any user interaction on the nav.worklog ui state should go
 * here. Note there is an associated service named workLog, which can
 * be utilized by any controller for logging work.
 */
app.controller('workLogController', function($scope, $state, workLog) {
});
