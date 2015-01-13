/* 
 * session service. the purpose of this service is persistence of
 * session data, in a manner accessable by any angular contoller.
 */

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
      // store to DB instead !
      // validating data:
      data.user.pioneerId = data.user.pioneerId.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+/g, "");
      data.user.notes     = data.user.notes.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+/g, "");
      $cookieStore.put(cid, data);
    },
    'data' : function() {     
      return data;
    }
  };
  return sessionSingleton;
});

