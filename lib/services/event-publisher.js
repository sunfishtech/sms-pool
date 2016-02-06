'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventPublisher;

var _ramdaFantasy = require('ramda-fantasy');

var _ramda = require('ramda');

function EventPublisher() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    return {
      /* :: String -> Object -> Observable Object */
      publish: (0, _ramda.curry)(function (topic, evt) {
        return env.eventBus.publish(evt, topic);
      }),
      /* :: Object -> Observable Object */
      broadcast: function broadcast(evt) {
        return env.eventBus.publish(evt);
      }
    };
  });
}
module.exports = exports['default'];