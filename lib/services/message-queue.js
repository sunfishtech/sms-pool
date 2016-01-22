'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MessageQueue;

var _ramdaFantasy = require('ramda-fantasy');

var _utils = require('../utils');

var _smsMessage = require('../messages/sms-message');

/* :: SmsMessage -> MessageQueue -> Future Error Message */
function _enqueueMessage(message, queue) {
  return (0, _utils.promiseToFuture)(queue.enqueueMessage, message);
}

/* :: SmsMessage -> Future Error Object*/
function _ackMessage(message, queue) {
  return (0, _utils.promiseToFuture)(queue.ackMessage, message);
}

function MessageQueue() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    return {
      /* :: SmsMessage -> Future Error SmsMessage */
      enqueueMessage: function enqueueMessage(message) {
        return _enqueueMessage(message, env.messageQueue).map((0, _smsMessage.setStatus)(_smsMessage.STATUS.ENQUEUED));
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