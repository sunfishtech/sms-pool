'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SmsPool;

var _pipelines = require('./pipelines');

var _ramda = require('ramda');

var _config2 = require('./config');

var _messages = require('./messages');

var createEnvironment = function createEnvironment(services) {
  return services;
}; // should be a record

var initServices = function initServices(services) {
  return services.forEach(function (svc) {
    if (svc.init) svc.init();
  });
};

var startServices = function startServices(services) {
  return services.forEach(function (svc) {
    if (svc.start) svc.start();
  });
};

var disposeServices = function disposeServices(services) {
  return services.forEach(function (svc) {
    if (svc.dispose) svc.dispose();
  });
};

/* consider a per-command context that wraps the
   future pipeline and has an 'execute' and 'subscribe'
   method. This is returned from commands/method calls,
   and wraps an Rx observable that will prdoduce events
   and surface errors. subscribe will output results as they
   occur, and execute will gather the output events/error
   into an object and return that to the user.

   Look as kinesis for distribution & buffering
*/
function SmsPool(_config) {
  var config = (0, _config2.createConfig)(_config);
  var svcs = (0, _config2.createServices)(config);
  var events = svcs.eventBus;

  var executePipeline = (0, _ramda.curry)(function (pipeline, command) {
    var env = createEnvironment(svcs);

    return pipeline.run(env)(command);
  });

  // command handlers
  var sendMessage = executePipeline(_pipelines.SendNextMessage);
  var submitMessage = executePipeline(_pipelines.EnqueueMessage);

  initServices(svcs);
  svcs.messageQueue.subscribe(function (message) {
    return sendMessage(message).fork(function (err) {
      return events.publishError(err);
    }, function (res) {
      return events.publish(new _messages.MessageAccepted({ messageId: res.id, vendorId: res.vendorId }));
    });
  }, function (err) {
    return events.publishError(err);
  }, function (done) {});
  startServices(svcs);

  return {
    services: svcs,
    events: events,
    sendMessage: function sendMessage(messageData) {
      return submitMessage(messageData);
    },
    dispose: function dispose() {
      return disposeServices(svcs);
    }
  };
}
module.exports = exports['default'];