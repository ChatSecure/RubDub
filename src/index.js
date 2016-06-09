var xmpp = require('./xmpp.js');
var api = require('./api.js');
var program = require('commander');


program
  .version('0.0.2')
  .option('-p, --port <n>', 'The server port number', parseInt)
  .option('-b, --bindAddress <value>', 'The server bind address')
  .option('-d, --domainAddress <value>', 'The server domain')
  .option('-k, --keyPath <path>', 'The path of the TLS key')
  .option('-c, --certPath <path>', 'The path of the TLS certificate')
  .parse(process.argv);

var port = program.port || 5269;
var bindAddress = program.bindAddress;
var domain = program.domainAddress;
var tls = {};
tls.keyPath = program.keyPath;
tls.certPath = program.certPath;
var options = {
  tls:tls
};

var xServer = new xmpp.xmppServer();
xServer.setup(port,bindAddress,domain,options);
xServer.on('push',function(pushInfo){
  api.sendMessage(pushInfo.token,null,function(err,result){

  });
});
