# RubDub

A simple XMPP Push Service for [XEP-0357: Push Notifications ](http://xmpp.org/extensions/xep-0357.html).

## What does this do?

Interoperability between XMPP Push Notifications and the ChatSecure app server.

1. This has a super simple XMPP server that accepts s2s connections. It only looks for incoming pubsub notifications.
2. It parses these stanzas and finds the ChatSecure Push token.
3. It then takes that token and sends `POST` to the [ChatSecure Push Server](https://github.com/ChatSecure/ChatSecure-Push-Server) `/messages` endpoint.

## Setup
`npm install`

## Todo
- [ ] Needs testing with real push tokens
- [ ] Needs testing against *real* XMPP server with XEP-0357
