'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MessageQueue;

var _ramdaFantasy = require('ramda-fantasy');

var _smsMessage = require('../messages/sms-message');

function MessageQueue() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    return {
      /* :: SmsMessage -> Observable SmsMessage */
      enqueueMessage: function enqueueMessage(message) {
        return env.messageQueue.enqueueMessage(message).map((0, _smsMessage.setStatus)(_smsMessage.STATUS.ENQUEUED));
      },

      /* :: SmsMessage -> Future Error SmsMessage */
      ackMessage: function ackMessage(message) {
        return env.messageQueue.ackMessage(message);
      }
    };
  });
}
module.exports = exports['default'];