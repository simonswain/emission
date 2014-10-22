# Emission

Version: 0.0.2

[![Build Status](https://travis-ci.org/simonswain/emission.png)](https://travis-ci.org/simonswain/emission)

Redis PubSub helper

## Installing

```bash
npm install emission
```

## Usage

## Config

```javascript
// use default Redis on localhost
var emission = require('emission')();
```

```javascript
// use another Redis and specify a custom key prefix
var opts = {
  prefix: 'my-prefix',
  redis = {
    host: 'myredis.host',
    port: 6379
   }
};
var emission = require('emission')(opts);
```

### Listener

```javascript

// create a subscriber with a handler and listen for messages matching
// a topic (you can use * wildcards in your topic)

var handler = function(pattern, data){
  console.log(pattern, data);
};

var subscriber = api.listener(
  'my-topic',
  handler,
  done // optional callback
);
```

```javascript
// create a subscriber with a handler only. add topics later

var subscriber = api.listener(
  handler,
  done // optional callback
);
```

```// dynamically add a topic
subscriber.sub('another-topic');

// dynamically stop listening for a topic
subscriber.unsub('another-topic');

// dynamically stop listening for a topic
subscriber.quit(done);

```

### Emitter

```
// emit a message to a topic

// messages are sent and recieved as JSON. Emission takes care of
// stringification and parsing.

emission.emit('my-topic', {foo: 'bar'});
```

## License

Copyright (c) 2014 Simon Swain

Licensed under the MIT license.
