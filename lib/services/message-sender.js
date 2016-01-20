'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MessageSender;

var _ramdaFantasy = require('ramda-fantasy');

var _utils = require('../utils');

/* :: SmsMessage -> SmsApi -> Future Error String */
function sendMessage(message, smsApi) {
  return (0, _utils.promiseToFuture)(smsApi.sendMessage, message);
}

function throttledSendMessage(message, smsApi, rateLimiter) {
  return (0, _ramdaFantasy.Future)(function (_, respond) {
    rateLimiter.limit(message.from, respond);
  }).chain(function (_) {
    return sendMessage(message, smsApi);
  });
}

function MessageSender() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    var limiter = env.rateLimiter;

    return {
      /* :: SmsMessage -> Future Error SmsMessage */
      sendMessage: function sendMessage(message) {
        return throttledSendMessage(message, env.smsApi, limiter).map(function (_) {
          return message;
        });
      }
    };
  });
}
module.exports = exports['default'];