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
