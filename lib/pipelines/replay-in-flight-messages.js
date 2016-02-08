'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rx = require('rx');

var _pipeline = require('../pipeline');

var _pipeline2 = _interopRequireDefault(_pipeline);

var _eventPublisher = require('../services/event-publisher');

var _eventPublisher2 = _interopRequireDefault(_eventPublisher);

var _messages = require('../messages');

var _eventTopics = require('../event-topics');

var _eventTopics2 = _interopRequireDefault(_eventTopics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var messageToEvent = function messageToEvent(message) {
  return _rx.Observable.just(new _messages.MessageEnqueued({ message: message }));
};

exports.default = (0, _pipeline2.default)({
  with: [_eventPublisher2.default],
  yield: function _yield(evts) {
    return [messageToEvent, evts.publish(_eventTopics2.default.ENQUEUED_MESSAGES)];
  }
});
module.exports = exports['default'];