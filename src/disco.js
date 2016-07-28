var ltx    = require('ltx');

module.exports.isDiscoQuery = function(stanza) {
  var queryChild = stanza.getChildrenByFilter(function (child){
    // check if it's a disco queryChild
    return child.name === 'query' && child.attrs.xmlns === 'http:\/\/jabber.org\/protocol\/disco#info';
  })[0];

  return (queryChild && stanza.attrs.type === 'get');
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
module.exports.discoResponse = function(stanza,cb) {
  var fromJID = stanza.attrs.from;
  var toJID = stanza.attrs.to;
  var id = stanza.attrs.id;

  if (fromJID && toJID && id) {
    //Create respnose for discovery
    var identityStanza = new ltx.Element('identity',{'category':'pubsub','type':'push'});
    var featureStanza = new ltx.Element('feature',{'var':'urn:xmpp:push:0'});
    var queryStanza = new ltx.Element('query',{'xmlns':'http://jabber.org/protocol/disco#info'});
    queryStanza.cnode(identityStanza);
    queryStanza.cnode(featureStanza);
    var iqStanza = new ltx.Element('iq',{'from':toJID,'to':fromJID,'id':id,'type':'result'});
    iqStanza.cnode(queryStanza);
    cb(null,iqStanza);
  } else {
    var error = new Error('Invalid stanza. MIssing user JID, server JID, or id');
    cb(error);
  }
};
