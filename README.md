Presence Service
================

## Overview

It's a service that check if a user is still in the system.

## How to use it

* The client will do a PING to the server and the server will respond with a PONG to the client.
* Uses amqp exchanges: 
   **presence** exchange is an incoming exchange for the PINGs and LOGOUTs 
   
*This service creates a new exchange named presence.v1 who is bind to a queue named presence.v1.*

### Samples

Inside the folder */src/samples* there are 2 examples for testing **ping** and **logout** injecting directly messages to the exchange.

### HTTP Public API

*Needs the **http-relay-service***

**Entry point:** *relay/presence/v1*

**POST *userEvent/ping***: sends a ping with the timestamp of current user 

**POST *routingKey/logout/userEvent/logout***: logout the current user 

### AMQP Public API

**Entry point:** exchange presence.v1

Inside the folder */src/samples* you can find a couple of message examples for Logout and Ping. 

## Quick help

* Install modules

```bash
    $ npm install
```

* Check tests

```bash
    $ ./tests.sh
```
