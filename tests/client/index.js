var Client = require('node-xmpp-client');
var secret = require('./secret.js');
var xmpp = require('../../src/xmpp.js');

var NS_XMPP_DISCO = 'http://jabber.org/protocol/disco#info';

/**
Utility Functions
*/

var handleError = function(err) {
  console.log(error);
};

/**
Setup Client 1 the client to register
*/
var client = new Client(secret.a);
client.on('online', function(dict) {
  //send enable push stanza
  // var stanza = new Client.Stanza.Element()
  // client.send( new Client.Stanza.Element('iq',{type: 'get',to : dict.jid.domain, from : dict.jid, id : 'disco1'}).c('query', { xmlns: NS_XMPP_DISCO }));
  /**
    <iq type='set' id='x42'>
      <enable xmlns='urn:xmpp:push:0' jid='push-5.client.example' node='yxs32uqsflafdk3iuqo' />
    </iq>

    OR

    <iq type='set' id='x43'>
      <enable xmlns='urn:xmpp:push:0' jid='push-5.client.example' node='yxs32uqsflafdk3iuqo'>
        <x xmlns='jabber:x:data'>
          <field var='FORM_TYPE'><value>http://jabber.org/protocol/pubsub#publish-options</value></field>
          <field var='secret'><value>eruio234vzxc2kla-91<value></field>
          </x>
      </enable>
    </iq>
  */
  var enableStanza = new Client.Stanza.Element('iq',{type:'set',id:'enable1'});
  var data = Client.parse('<x xmlns=\'jabber:x:data\'><field var=\'FORM_TYPE\'><value>http://jabber.org/protocol/pubsub#publish-options</value></field><field var=\'token\'><value>supersecret</value></field></x>')
  enableStanza.c('enable',{xmlns:'urn:xmpp:push:0', jid:secret.pushServerJID}).cnode(data);
  //<presence to='juliet@example.com' type='subscribe'/>
  //var subscribe = new Client.Stanza.Element('presence',{to:'b@localhost',type:'subscribe'});
  //client.send(subscribe);
  client.send(enableStanza);

  var message = new Client.Stanza.Element('message', {
      to: secret.b.jid,
      from: secret.a.jid,
      type: 'chat',
      id: Date.now()
    });
    message.c('body').t('Donkey');
    setTimeout(function(){
      client.send(message);
    },2000);
});

client.on('stanza', function(stanza){
  console.log('Incoming A: ' + stanza.toString());
});

client.on('error', function(error){
  handleError(error);
});

/**
Setup Client 2 the client to register
*/
var friend = new Client(secret.b);

friend.on('online',function(dict) {
  var message = new Client.Stanza.Element('message', {
      to: secret.a.jid,
      from: secret.b.jid+'/'+dict.jid.resource,
      type: 'chat',
      id: Date.now(),
    });
    message.c('body').t('Hey where you at bro?');

    setTimeout(function(){
      console.log("sending Message from B to A" +message.toString());
      friend.send(message);
    },2000);
});

friend.on('stanza', function(stanza){
  console.log('Incoming B: ' + stanza.toString());
});

friend.on('error', function(stanza){
  handleError(error);
});
