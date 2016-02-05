'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MockProvider;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _rx = require('rx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function MockProvider() {
  var _sentMessages = [];
  var numbers = ['num1', 'num2', 'num3', 'num4'];

  return {
    getAvailableNumbers: function getAvailableNumbers() {
      return _rx.Observable.just(numbers);
    },
    sendMessage: function sendMessage(message) {
      _sentMessages.push(message);
      return _rx.Observable.just(_uuid2.default.v4());
    },
    sentMessages: _sentMessages
  };
}
module.exports = exports['default'];