'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rx = require('rx');

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

var _eventPublisher = require('../services/event-publisher');

var _eventPublisher2 = _interopRequireDefault(_eventPublisher);

var _messageEnqueued = require('../messages/message-enqueued');

var _messageEnqueued2 = _interopRequireDefault(_messageEnqueued);

var _eventTopics = require('../event-topics');

var _eventTopics2 = _interopRequireDefault(_eventTopics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var messageToEvent = function messageToEvent(message) {
  return _rx.Observable.just(new _messageEnqueued2.default({ message: message }));
};

exports.default = (0, _pipeline2.default)({
  with: [_messageFactory2.default, _numberPool2.default, _messageStore2.default, _messageQueue2.default, _eventPublisher2.default],
  yield: function _yield(message, pool, store, queue, evts) {
    return [message.create(_smsMessage2.default, 'id'), pool.appendFromIfMissing, queue.enqueueMessage, store.storeMessage, messageToEvent, evts.publish(_eventTopics2.default.ENQUEUED_MESSAGES)];
  }
});
module.exports = exports['default'];