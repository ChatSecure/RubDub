var xmpp   = require('node-xmpp-server')
var events = require('events');
var api    = require('./api.js')

function xmppServer() {
  events.EventEmitter.call(this);

}

xmppServer.prototype = new events.EventEmitter;

xmppServer.prototype.setup = function(s2sPort, bindAddress, domain, opts) {
  router = new xmpp.Router(s2sPort, bindAddress, opts)
  router.register(domain,function (stanza){
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

var parseStanza = function (stanza,cb) {
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
  parseStanza(stanza,function(err,result){
    this.emitPushEvent(pushInfo)
  });
}


module.exports.parseStanza = parseStanza
module.exports.xmppServer = xmppServer
