## Test client

The purpose of this is to run an integration test against a running xmpp server with XEP-0357 and a running pubsub node like RubDub.

### How it works

It assumes that the buddies are already created on the xmpp server and are able to send each other messages.

It sends the push registration stanza for buddy a and then sends a message to that buddy in order to trigger a push.

### secret.js

This file has the credentials for the two buddies

```js
module.exports.a = {
  'jid':'a@example.com',
  'password':'a'
};

module.exports.b = {
  'jid':'b@example.com',
  'password':'b'
};

module.exports.pushServerJID = 'xmpp.example.org';

```
