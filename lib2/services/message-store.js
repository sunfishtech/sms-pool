'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MessageStore;

var _ramdaFantasy = require('ramda-fantasy');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _utils = require('../utils');

var _messages = require('../messages');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* :: SmsMessage -> MessageStore -> Future Error Unit */
function _storeMessage(message, messageStore) {
  return (0, _utils.promiseToFuture)(messageStore.put, message);
}

/* :: MessageTag -> MessageStore -> Object */
function _getMessage(messageId, messageStore) {
  return (0, _utils.promiseToFuture)(messageStore.get, messageId);
}

function MessageStore() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    return {
      /* :: SmsMessage -> Future Error MessageEnqueued */
      storeMessage: function storeMessage(message) {
        return _storeMessage(message, env.messageStore).map(function (_) {
          return message;
        });
      },

      /* :: String -> Future Error SmsMessage */
      getMessage: function getMessage(messageId) {
        return _getMessage(messageId, env.messageStore).map(_ramda2.default.pick(['id', 'from', 'to', 'message', 'status', 'callbackUrl'])).map(_messages.SmsMessage);
      }
    };
  });
}
module.exports = exports['default'];