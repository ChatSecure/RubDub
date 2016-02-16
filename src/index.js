var xmpp = require('./xmpp.js');
var api = require('./api.js');

var port = 5269;
var bindAddress = '';
var domain = '';
var options = {

};

var xServer = new xmpp.xmppServer();
xServer.setup(port,bindAddress,domain,options);
xServer.on('push',function(pushInfo){
  api.sendMessage(pushInfo.token,null,function(err,result){

  });
});
