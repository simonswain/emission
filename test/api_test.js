"use strict";

var async = require('async');
var api;

var myTopic = 'my-topic';
var otherTopic = 'other-topic';

var myMsg = {
  foo: 'bar'
};

var otherMsg = {
  bas: 'quux'
};

exports.api = {

  'boot': function(test) {
    api = require('../lib').api();
    test.done();
  },

  'sub': function(test) {

    var subscriber;

    var handler = function(pattern, data) {
      test.deepEqual(data, myMsg);
      subscriber.quit();
      test.done();
    };

    subscriber = api.listener(
      myTopic,
      handler,
      function(){
        api.emit(myTopic, myMsg);
      }
    );
  },

  'sub-chained': function(test) {

    var subscriber;

    var handler = function(pattern, data) {
      test.deepEqual(data, myMsg);
      subscriber.quit();
      test.done();
    };

    subscriber = api.listener(
      handler
    );

    subscriber.sub(
      myTopic,
      function(){
        api.emit(myTopic, myMsg);
      }
    );

  },


  'multi-sub': function(test) {

    var subscriber;

    var seen = [];

    var handler = function(pattern, data) {
      seen.push([pattern, data]);
      if(seen.length === 2){
        test.done();
      }
    };

    subscriber = api.listener(handler);

    async.series([
      function(next){
        subscriber.sub(myTopic, next);
      },
      function(next){
        subscriber.sub(otherTopic, next);
      },
      function(next){
        api.emit(myTopic, myMsg, next);
      },
      function(next){
        api.emit(otherTopic, otherMsg, next);
      }
    ]);
  },


  'multi-sub-unbsub': function(test) {

    var subscriber;

    var seen = [];

    var handler = function(pattern, data) {
      seen.push([pattern, data]);
      if(seen.length === 3){
        test.done();
      }
    };

    subscriber = api.listener(handler);

    async.series([
      function(next){
        subscriber.sub(myTopic, next);
      },
      function(next){
        subscriber.sub(otherTopic, next);
      },
      function(next){
        api.emit(myTopic, myMsg, next);
      },
      function(next){
        api.emit(otherTopic, otherMsg, next);
      },
      function(next){
        subscriber.unsub(otherTopic, next);
      },
      function(next){
        api.emit(otherTopic, otherMsg, next);
      },
      function(next){
        api.emit(myTopic, myMsg, next);
      }
    ]);
  },


  'quit': function(test) {
    api.quit(function() {
      test.done();
    });
  }

};
