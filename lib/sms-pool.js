'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SmsPool;

var _pipelines = require('./pipelines');

var _ramda = require('ramda');

var _config2 = require('./config');

/* consider a per-command context that wraps the
   future pipeline and has an 'execute' and 'subscribe'
   method. This is returned from commands/method calls,
   and wraps an Rx observable that will prdoduce events
   and surface errors. subscribe will output results as they
   occur, and execute will gather the output events/error
   into an object and return that to the user.
*/
function SmsPool(_config) {
  var config = (0, _config2.createConfig)(_config);
  var svcs = (0, _config2.createServices)(config);

  var events = svcs.eventBus;

  var createEnvironment = function createEnvironment() {
    return svcs;
  }; // should be a record

  var executePipeline = (0, _ramda.curry)(function (pipeline, arg) {
    var env = createEnvironment();

    return pipeline.run(env)(arg);
  });

  var sendMessage = executePipeline(_pipelines.SendNextMessage);
  var submitMessage = executePipeline(_pipelines.EnqueueMessage);

  svcs.messageQueue.subscribe(function (message) {
    return sendMessage(message).fork();
  }, function (err) {
    return console.log(err);
  }, function (done) {});

  return {
    sendMessage: function sendMessage(messageData) {
      return submitMessage(messageData);
    },
    services: svcs,
    config: config,
    events: events
  };
}
module.exports = exports['default'];