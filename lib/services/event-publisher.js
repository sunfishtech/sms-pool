'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventPublisher;

var _ramdaFantasy = require('ramda-fantasy');

var _utils = require('../utils');

var _ramda = require('ramda');

/* :: String -> Object -> Future Error Object */
function publishEvent(topic, evt, eventBus) {
  return (0, _utils.promiseToFuture)(eventBus.publish, evt, topic);
}

function EventPublisher() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    return {
      /* :: String -> Object -> Future Error Object */
      publish: (0, _ramda.curry)(function (topic, evt) {
        return publishEvent(topic, evt, env.eventBus);
      }),
      /* :: Object -> Future Error Object */
      broadcast: function broadcast(evt) {
        return publishEvent(undefined, evt, env.eventBus);
      }
    };
  });
}
module.exports = exports['default'];