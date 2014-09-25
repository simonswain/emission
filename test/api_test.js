"use strict";

var async = require('async');
var api = require('../lib')();

var sub;

var myTopic = 'my-topic';

var myMsg = {
  foo: 'bar'
};

exports.api = {
  'make-sub': function(test) {

    var handler = function(pattern, data) {
      //console.log('HDLR:', pattern, data);
      test.deepEqual(data, myMsg);
      test.done();
    };

    sub = api.listener(
      myTopic,
      handler,
      function(){
        api.emit(myTopic, myMsg);
      }
    );

  },
  'quit': function(test) {
    sub.quit();
    api.quit(function() {
      test.done();
    });
  }

};
