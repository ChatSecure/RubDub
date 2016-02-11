var test = require('tape')

var xmpp = require('../src/xmpp.js')
var api = require('../src/api.js')
var stanza = require('node-xmpp-server')

var stanzaString = '<iq type=\'set\'     from=\'user@example.com\'     to=\'push-5.client.example\'     id=\'n12\'>   <pubsub xmlns=\'http:\/\/jabber.org\/protocol\/pubsub\'>     <publish node=\'yxs32uqsflafdk3iuqo\'>       <item>         <notification xmlns=\'urn:xmpp:push:0\'>           <x xmlns=\'jabber:x:data\'>             <field var=\'FORM_TYPE\'><value>urn:xmpp:push:summary<\/value><\/field>             <field var=\'message-count\'><value>3<\/value><\/field>             <field var=\'last-message-sender\'><value>juliet@capulet.example\/balcony<\/value><\/field>             <field var=\'last-message-body\'><value>Wherefore art thou, Romeo?<\/value><\/field>           <\/x>           <additional xmlns=\'http:\/\/example.com\/custom\'>Additional custom elements<\/additional>         <\/notification>       <\/item>     <\/publish>     <publish-options>       <x xmlns=\'jabber:x:data\'>         <field var=\'FORM_TYPE\'><value>http:\/\/jabber.org\/protocol\/pubsub#publish-options<\/value><\/field>         <field var=\'token\'><value>eruio234vzxc2kla-91<\/value><\/field>       <\/x>     <\/publish-options>   <\/pubsub> <\/iq>'

test('Stanza Parsing', function(t) {
  var s = stanza.parse(stanzaString)

  xmpp.parsePushStanza(s,function(error,result){
    t.equal(result.token,'eruio234vzxc2kla-91')
    t.equal(result.messageCount,3)
    t.end(error);
  });

})

test("XMPP-emit", function(t) {

  var info = "something cool"

  var server = new xmpp.xmppServer()
  server.on('push',function(pushInfo) {
    t.equal(info,pushInfo)
    t.end()
  })

  server.emitPushEvent(info)

})

test('XMPP-QueryResponse', function(t) {
  var response = xmpp.queryResponse('user@example.com','me@push.com')
  var expectedResult = "<iq from=\"me@push.com\" to=\"user@example.com\" id=\"disco1\" type=\"result\"><query xmlns=\"http://jabber.org/protocol/disco#info\"><identity category=\"pubsub\" type=\"push\"/><feature var=\"urn:xmpp:push:0\"/></query></iq>"
  t.equal(response.toString(),expectedResult)
  t.end()
})

test('API-messageJson', function(t) {
  api.messageJson('Thisisatoken',null,function(err,result){
    t.equal(JSON.stringify(result),JSON.stringify({'token':'Thisisatoken'}))
    t.end(err)
  })
})

test('API-messageJson-error', function(t) {
  api.messageJson(null,null,function(err,result){
    t.ok(err)
    t.end()
  })
})



/*
//Testing against real server either change server.js to include settings for localhost or running remote server
test('API-messageSend', function(t){
  api.sendMessage('token123456',null,function(err,result){
    t.ok(err)
    t.end()
  })
})
*/
