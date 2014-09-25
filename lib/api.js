"use strict";

var async = require('async');
var Redis = require('redis');

module.exports = function(opts){

  opts = opts || {};

  var env = process.env.NODE_ENV || 'development';

  if(!opts.redis){
    opts.redis = {
      host: '127.0.0.1',
      port: 6379
    };
  }

  if(!opts.prefix){
    opts.prefix = 'em:' + env;
  }

  var redis = Redis.createClient(
    opts.redis.port, 
    opts.redis.host
  );

  var api = {};

  var makeKey = function(topic){
    return opts.prefix + ':' + topic;
  };

  api.emit = function(topic, data, done){
    // console.log('EMIT:', makeKey(topic), JSON.stringify(data));

    if(!done){
      done = function(){};
    }

    redis.publish(
      makeKey(topic),
      JSON.stringify(data),
      done
    );
  };


  // list of events listeners (need to quit these?)
  var listeners = [];

  api.listener = function(match, handler, done){
    var key;
    
    // if no match supplied, then get all events
    if(arguments.length === 2){
      done = arguments[1];
      handler = arguments[0];
      match = false;
      key = opts.prefix + ':*';
    } else {
      key = opts.prefix + ':' + match;
    }

    var sub = Redis.createClient(
      opts.redis.port,
      opts.redis.host
    );

    if(!done){
      done = function(){};
    }

    sub.psubscribe(key, done);

    sub.on('pmessage', function(pattern, channel, data){
      //console.log('RECV:', pattern, msg);
      if(data && typeof data !== 'undefined' && data !== 'undefined'){
        data = JSON.parse(data);
      }
      handler(pattern, data);
    });
    
    var quit = function(){
      sub.quit();
    };

    listeners.push(sub);

    return {
      quit: quit
    };



  };

  // cleanup for exit
  api.quit = function(next) {
    var quit = function(x, cb){
      x.quit();
      cb();
    };
    async.eachSeries(listeners, quit, function(){
      redis.quit();
      next();
    });
  };

  // export the api methods
  return api;

};
