'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pipeline = require('../pipeline');

var _pipeline2 = _interopRequireDefault(_pipeline);

var _numberPool = require('../services/number-pool');

var _numberPool2 = _interopRequireDefault(_numberPool);

var _messageQueue = require('../services/message-queue');

var _messageQueue2 = _interopRequireDefault(_messageQueue);

var _messageStore = require('../services/message-store');

var _messageStore2 = _interopRequireDefault(_messageStore);

var _messageFactory = require('../services/message-factory');

var _messageFactory2 = _interopRequireDefault(_messageFactory);

var _smsMessage = require('../messages/sms-message');

var _smsMessage2 = _interopRequireDefault(_smsMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _pipeline2.default)({
  with: [_messageFactory2.default, _numberPool2.default, _messageStore2.default, _messageQueue2.default],
  yield: function _yield(message, pool, store, queue) {
    return [message.create(_smsMessage2.default, 'id'), pool.appendFromIfMissing, queue.enqueueMessage, store.storeMessage];
  }
});
module.exports = exports['default'];