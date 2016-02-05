'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MessageSender;

var _ramdaFantasy = require('ramda-fantasy');

var _smsMessage = require('../messages/sms-message');

var _rx = require('rx');

var _ramda = require('ramda');

function MessageSender() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    var limit = env.rateLimiter.limit('from');
    var send = env.smsApi.sendMessage;
    var setVendorId = (0, _ramda.curry)(function (message, vendorId) {
      return message.set('vendorId', vendorId);
    });

    return {
      /* :: SmsMessage -> Observable SmsMessage */
      sendMessage: function sendMessage(message) {
        return _rx.Observable.just(message).flatMap(limit).flatMap(send).map(setVendorId(message)).map((0, _smsMessage.setStatus)(_smsMessage.STATUS.SENT));
      }
    };
  });
}
module.exports = exports['default'];