'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MessageQueue;

var _ramdaFantasy = require('ramda-fantasy');

var _utils = require('../utils');

/* :: SmsMessage -> MessageQueue -> Future Error Unit */
function _enqueueMessage(message, queue) {
  return (0, _utils.promiseToFuture)(queue.enqueueMessage, message);
}

/* :: SmsMessage -> Promise Object Error */
function _ackMessage(message, queue) {
  return (0, _utils.promiseToFuture)(queue.ackMessage, message);
}

function MessageQueue() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    return {
      /* :: SmsMessage -> Future Error SmsMessage */
      enqueueMessage: function enqueueMessage(message) {
        return _enqueueMessage(message, env.messageQueue).map(function (_) {
          return message;
        });
      },

      /* :: SmsMessage -> Future Error SmsMessage */
      ackMessage: function ackMessage(message) {
        return _ackMessage(message, env.messageQueue).map(function (_) {
          return message;
        });
      }
    };
  });
}
module.exports = exports['default'];