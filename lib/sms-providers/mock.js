'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MockProvider;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function MockProvider() {
  var _sentMessages = (0, _immutable.List)();
  var numbers = ['num1', 'num2', 'num3', 'num4'];

  return {
    getAvailableNumbers: function getAvailableNumbers() {
      return Promise.resolve(numbers);
    },
    sendMessage: function sendMessage(message) {
      _sentMessages.push(message);
      return Promise.resolve(_uuid2.default.v4());
    },
    sendMessages: _sentMessages
  };
}
module.exports = exports['default'];