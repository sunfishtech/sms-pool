'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SmsPool;

var _pipelines = require('./pipelines');

var _ramda = require('ramda');

var _config2 = require('./config');

var _serviceError = require('./messages/service-error');

var _serviceError2 = _interopRequireDefault(_serviceError);

var _numberPool = require('./services/number-pool');

var _numberPool2 = _interopRequireDefault(_numberPool);

var _eventTopics = require('./event-topics');

var _eventTopics2 = _interopRequireDefault(_eventTopics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createEnvironment = function createEnvironment(services) {
  return services;
}; // should be a record

var initServices = function initServices(services) {
  return services.forEach(function (svc) {
    if (svc.init) svc.init();
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

  var executeComponent = function executeComponent(component) {
    var env = createEnvironment(svcs);

    return component.run(env);
  };

  var executePipeline = (0, _ramda.curry)(function (pipeline, command) {
    return executeComponent(pipeline)(command);
  });

  // command handlers
  var sendMessage = executePipeline(_pipelines.SendNextMessage);
  var submitMessage = executePipeline(_pipelines.EnqueueMessage);
  var getAvailableNumbers = executeComponent((0, _numberPool2.default)()).availableNumbers;
  var clearNumbers = executeComponent((0, _numberPool2.default)()).clearCache;
  var replayInFlight = executeComponent(_pipelines.ReplayInFlightMessages);

  var publishError = function publishError(err) {
    var errMessage = err & err.message ? err.message : err ? err.toString() : 'Unknown Error';

    return events.publish(new _serviceError2.default({ error: errMessage }), _eventTopics2.default.ERRORS).subscribeOnError(function (err) {
      throw err;
    });
  };

  var listenForEnqueuedMessages = function listenForEnqueuedMessages() {
    events.subscribe(_eventTopics2.default.ENQUEUED_MESSAGES, function (event) {
      return sendMessage(event.message).subscribeOnError(publishError);
    }, publishError);
  };

  var replayInFlightMessages = function replayInFlightMessages() {
    svcs.messageQueue.inFlightMessages().flatMap(replayInFlight).subscribeOnError(publishError);
  };

  /* Startup Sequence */
  initServices(svcs);
  listenForEnqueuedMessages();
  replayInFlightMessages();

  /* API */
  return {
    EVENT_TOPICS: _eventTopics2.default,
    services: svcs,
    events: events,
    sendMessage: submitMessage,
    availableNumbers: function availableNumbers() {
      return getAvailableNumbers().map(function (_) {
        return _.numbers.toJS();
      });
    },
    clearNumberPool: function clearNumberPool() {
      return clearNumbers();
    },
    dispose: function dispose() {
      return disposeServices(svcs);
    }
  };
}
module.exports = exports['default'];