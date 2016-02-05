'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rx = require('rx');

var _pipeline = require('../pipeline');

var _pipeline2 = _interopRequireDefault(_pipeline);

var _messageQueue = require('../services/message-queue');

var _messageQueue2 = _interopRequireDefault(_messageQueue);

var _messageStore = require('../services/message-store');

var _messageStore2 = _interopRequireDefault(_messageStore);

var _messageSender = require('../services/message-sender');

var _messageSender2 = _interopRequireDefault(_messageSender);

var _messageAccepted = require('../messages/message-accepted');

var _messageAccepted2 = _interopRequireDefault(_messageAccepted);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var messageToEvent = function messageToEvent(message) {
  return _rx.Observable.just(new _messageAccepted2.default({ message: message }));
};

/* :: Reader Env (() -> (Future Error SmsMessage)) */
exports.default = (0, _pipeline2.default)({
  with: [_messageQueue2.default, _messageStore2.default, _messageSender2.default],
  yield: function _yield(queue, store, sender) {
    return [sender.sendMessage, queue.ackMessage, store.storeMessage, messageToEvent];
  }
});
module.exports = exports['default'];