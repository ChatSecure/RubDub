var xmpp   = require('node-xmpp-server')
var events = require('events');
var ltx    = require('ltx');
var api    = require('./api.js')

function xmppServer() {
  events.EventEmitter.call(this);
}

xmppServer.prototype = new events.EventEmitter;

xmppServer.prototype.setup = function(s2sPort, bindAddress, domain, opts) {
  this.router = new xmpp.Router(s2sPort, bindAddress, opts)
  this.router.register(domain,function (stanza){
    this.handleStanza(stanza)
  })
}

var formDataValue = function(stanza, varName) {
  if (!varName) {
    return
  }

  resultStanza = stanza.getChildrenByFilter(function (child){
    if (child.attrs) {
      return child.name = 'field' && child.attrs['var'] === varName
    }
    return false
  })[0]

  if (resultStanza) {
    return resultStanza.getChildText('value')
  }

  return null

}
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
  var identityStanza = new ltx.Element('identity',{'category':'pubsub','type':'push'})
  var featureStanza = new ltx.Element('feature',{'var':'urn:xmpp:push:0'})
  var queryStanza = new ltx.Element('query',{'xmlns':'http://jabber.org/protocol/disco#info'})
  queryStanza.cnode(identityStanza)
  queryStanza.cnode(featureStanza)
  var iqStanza = new ltx.Element('iq',{'from':ownServerJID,'to':fromJID,'id':'disco1','type':'result'})
  iqStanza.cnode(queryStanza)
  return iqStanza
}

var parsePushStanza = function (stanza,cb) {
  if(stanza.name !== 'iq') {
    cb(new Error('error not iq'),null)
    return
  }

  var result = {}

  var notificationNode = stanza.getChildrenByFilter(function (child){
    if (child.parent) {
      return child.parent.name === 'notification' && child.parent.attrs['xmlns'] === 'urn:xmpp:push:0' && child.name === 'x' && child.attrs['xmlns'] === 'jabber:x:data'
    }
  },true)[0]

  result.messageCount = parseInt(formDataValue(notificationNode,'message-count'))

  var publishOptions = stanza.getChildrenByFilter(function (child){
    if (child.parent) {
      return child.parent.name === 'publish-options' && child.name === 'x' && child.attrs['xmlns'] === 'jabber:x:data'
    }
    return false
  },true)[0]

  token = formDataValue(publishOptions,'token')

  result.token = token

  cb(null,result)
}

xmppServer.prototype.emitPushEvent = function(pushInfo) {
  if (pushInfo) {
    this.emit('push',pushInfo)
  }
}

xmppServer.prototype.handleStanza = function(stanza) {
  var queryChild = stanza.getChildrenByFilter(function (child){
    // check if it's a disco queryChild
    return child.name === 'query' && child.attrs['xmlns'] === 'http://jabber.org/protocol/disco#info'
  })[0]
  
  if (queryChlid) {
    //This is a disco query need to respond
    var userJID = stanza.attrs['from']
    var serverJID = stanza.attrs['to']
    var response = queryResponse(userJID,serverJID)
    this.router.send(response)

  } else {
    parsePushStanza(stanza,function(err,result){
      this.emitPushEvent(pushInfo)
    });
  }
}


module.exports.parsePushStanza = parsePushStanza
module.exports.xmppServer = xmppServer
module.exports.queryResponse = queryResponse
