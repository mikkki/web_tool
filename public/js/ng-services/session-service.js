/* 
 * session service. the purpose of this service is persistence of
 * session data, in a manner accessable by any angular contoller.
 */

app.factory('FormatJbrowse', ['$resource', function($resource) {
        return $resource('crud/format_jbrowse/:bacsession/:region', {"bacsession": "@bacsession", "region": "@region"}, {'query':  {method:'GET', isArray:false}});
}]);

app.factory('Bacitem', ['$resource', function($resource) {
        return $resource('crud/bacitem/:feature_id', {"feature_id": "@feature_id"}, {'query':  {method:'GET', isArray:true}});
}]);

app.factory('Coord_targets', ['$resource', function($resource) {
    return $resource('crud/tabix_interval/:bacsession', {"bacsession": "@bacsession"}, {'query':  {method:'GET', isArray:true}});
}]);

app.factory('Blast_targets', ['$resource', function($resource) {
        return $resource('crud/blast_targets/:bacsession', {"bacsession": "@bacsession"}, {'query':  {method:'GET', isArray:true}});
}]);

app.factory('Get_targets', ['$resource', function($resource) {
	return $resource('crud/session_targets/:session', {"session": "@session"}, {'query':  {method:'GET', isArray:true}});
}]);

app.factory('Bacsession', ['$resource', function($resource) {
        return $resource('crud/bacsession', {"pk": "@pk"}, {'query':  {method:'GET', isArray:true}});
}]);

app.factory('Bac', ['$resource', function($resource) {
        return $resource('crud/bac', {"pk": "@pk"}, {'query':  {method:'GET', isArray:true}});
}]);

app.factory('Targettype', ['$resource', function($resource) {
        return $resource('crud/targettype', {"pk": "@pk"}, {'query':  {method:'GET', isArray:true}});
}]);

app.factory('Target', ['$resource', function($resource) {
        return $resource('crud/target', {"pk": "@pk"}, {'query':  {method:'GET', isArray:true}, 'remove': {method:'DELETE'}, 'delete': {method:'DELETE'} });
}]);

app.factory('Bacset', ['$resource', function($resource) {
        return $resource('crud/bacset', {"pk": "@pk"}, {'query':  {method:'GET', isArray:true}});
}]);

app.factory('Genome', ['$resource', function($resource) {
        return $resource('crud/genome', {"pk": "@pk"}, {'query':  {method:'GET', isArray:true}});
}]);

app.factory('Organism', ['$resource', function($resource) {
        return $resource('crud/organism', {"pk": "@pk"}, {'query':  {method:'GET', isArray:true}});
}]);


app.factory('Session', ['$resource', function($resource) {
	return $resource('crud/sessioninfo', {"pk": "@pk"}, {'query':  {method:'GET', isArray:true}});  
}]);

app.factory('Session_pid', ['$resource', function($resource) {
        return function(url) {
            return $resource(url, {}, {'query':  {method:'GET', isArray:true}});
        };
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
      // validating data:
      data.user.pioneerId = data.user.pioneerId.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\s+/g, "");
      data.user.notes     = data.user.notes.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+/g, "");
      $cookieStore.put(cid, data);
    },
    'data' : function() {     
      return data;
    }
  };
  return sessionSingleton;
});

