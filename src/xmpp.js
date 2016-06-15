var xmpp   = require('node-xmpp-server');
var events = require('events');
var ltx    = require('ltx');
var api    = require('./api.js');

function xmppServer() {
  events.EventEmitter.call(this);
}

xmppServer.prototype = new events.EventEmitter();

xmppServer.prototype.setup = function(s2sPort, bindAddress, domain, opts) {
  this.router = new xmpp.Router(s2sPort, bindAddress, opts);
  var server = this;
  this.router.register(domain,function (stanza){
    server.handleStanza(stanza);
  });
};

var formDataValue = function(stanza, varName) {
  if (!varName || !stanza ) {
    return;
  }

  resultStanza = stanza.getChildrenByFilter(function (child){
    if (child.attrs) {
      return child.name === 'field' && child.attrs['var'] === varName;
    }
    return false;
  })[0];

  if (resultStanza) {
    return resultStanza.getChildText('value');
  }

  return null;
};
/**<iq from='push-5.client.example'
    to='user@example.com/mobile'
    id='x23'
    type='result'>
  <query xmlns='http://jabber.org/protocol/disco#info'>
    <identity category='pubsub' type='push' />
    <feature var='urn:xmpp:push:0'/>
    ...
  </query>
</iq>
*/
var queryResponse = function(fromJID, ownServerJID) {
  //Create respnose for discovery
  var identityStanza = new ltx.Element('identity',{'category':'pubsub','type':'push'});
  var featureStanza = new ltx.Element('feature',{'var':'urn:xmpp:push:0'});
  var queryStanza = new ltx.Element('query',{'xmlns':'http://jabber.org/protocol/disco#info'});
  queryStanza.cnode(identityStanza);
  queryStanza.cnode(featureStanza);
  var iqStanza = new ltx.Element('iq',{'from':ownServerJID,'to':fromJID,'id':'disco1','type':'result'});
  iqStanza.cnode(queryStanza);
  return iqStanza;
};

var parsePushStanza = function (stanza,cb) {
  if(stanza.name !== 'iq') {
    cb(new Error('error not iq'),null);
    return;
  }

  var result = {};

  var publishStanza = stanza.getChildrenByFilter( function(child){
    return child.name === 'publish';
  },true)[0];

  var formData = publishStanza.getChildrenByFilter( function(child){
    return child.name === 'x' && child.attrs.xmlns === "jabber:x:data";
  },true)[0];

  result.messageCount = parseInt(formDataValue(formData,'message-count'));

  var publishOptionsStanza = stanza.getChildrenByFilter( function(child){
    return child.name === 'publish-options';
  },true)[0];

  var token = null;
  if (publishOptionsStanza) {

    var publishOptionsFormData = publishOptionsStanza.getChildrenByFilter( function(child){
      return child.name === 'x' && child.attrs.xmlns === "jabber:x:data";
    },true)[0];

    token = formDataValue(publishOptionsFormData,'token');
    endpointURL = formDataValue(publishOptionsFormData,'endpoint');
  }

  result.token = token;
  result.endpoint = endpointURL;

  cb(null,result);
};

xmppServer.prototype.emitPushEvent = function(pushInfo) {
  if (pushInfo) {
    this.emit('push',pushInfo);
  }
};

xmppServer.prototype.handleStanza = function(stanza) {
  var queryChild = stanza.getChildrenByFilter(function (child){
    // check if it's a disco queryChild
    return child.name === 'query' && child.attrs.xmlns === 'http:\/\/jabber.org\/protocol\/disco#info';
  })[0];

  if (queryChild) {
    //This is a disco query need to respond
    var userJID = stanza.attrs.from;
    var serverJID = stanza.attrs.to;
    var response = queryResponse(userJID,serverJID);
    this.router.send(response);

  } else {
    var that = this;
    parsePushStanza(stanza,function(err,result){
      if (result) {
        that.emitPushEvent(result);
      }
    });
  }
};


module.exports.parsePushStanza = parsePushStanza;
module.exports.xmppServer = xmppServer;
module.exports.queryResponse = queryResponse;
