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

    var self = this;

    if(arguments.length === 1){
      handler = arguments[0];
      done = function(){};
      match = false;
    }

    if(arguments.length === 2){
      handler = arguments[0];
      done = arguments[1];
      match = false;
    }

    var prefix = opts.prefix + ':';

    var subClient = Redis.createClient(
      opts.redis.port,
      opts.redis.host
    );

    var sub = function(match, done){
      var key = prefix + match;
      if(!done){
        done = function(){};
      }
      subClient.psubscribe(key, done);
      return self;
    };

    var unsub = function(match, done){
      var key = prefix + match;
      if(!done){
        done = function(){};
      }
      subClient.punsubscribe(key, done);
      return self;
    };

    subClient.on(
      'pmessage',
      function(pattern, channel, data){
        if(data && typeof data !== 'undefined' && data !== 'undefined'){
          try{
            data = JSON.parse(data);
          } catch(e) {
            return false;
          }
        }
        var matched = channel.substr(prefix.length);
        handler(matched, data);
      });

    var quit = function(done){
      subClient.quit();
      if(done){
        done();
      }
    };

    if(match){
      sub(match, done);
    }

    listeners.push(subClient);

    return {
      sub: sub,
      unsub: unsub,
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
