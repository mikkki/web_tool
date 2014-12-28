/* 
 * session service. the purpose of this service is persistence of
 * session data, in a manner accessable by any angular contoller.
 */
app.factory('session', function($state, $cookieStore) {

  // TODO: refactor to store session data in db on server instead of
  // in the cookieStore service. Because 1) cookies store has a max of
  // 4096 bytes and 2) cookies are not secure form of storage.

  var cid = 'bacster-session'; // cookie id
  var data = $cookieStore.get(cid) || {};
  
  console.log('session loaded:');
  console.log(data);

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
      $cookieStore.put(cid, data);
      console.log('saved to session store:');
      console.log(data);
    },
    'data' : function() {
      return data;
    }
  };
  return sessionSingleton;
});
