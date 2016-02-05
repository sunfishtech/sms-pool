'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MessageStore;

var _ramdaFantasy = require('ramda-fantasy');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _messages = require('../messages');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function MessageStore() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    return {
      /* :: SmsMessage -> Future Error MessageEnqueued */
      storeMessage: function storeMessage(message) {
        return env.messageStore.put(message).map(function (_) {
          return message;
        });
      },

      /* :: String -> Future Error SmsMessage */
      getMessage: function getMessage(messageId) {
        return env.messageStore.get(messageId).map(_ramda2.default.pick(['id', 'from', 'to', 'message', 'status', 'callbackUrl'])).map(_messages.SmsMessage);
      }
    };
  });
}
module.exports = exports['default'];