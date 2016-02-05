'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typedImmutable = require('typed-immutable');

var _smsMessage = require('./sms-message');

var _smsMessage2 = _interopRequireDefault(_smsMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _typedImmutable.Record)({
  message: _smsMessage2.default
}, 'MessageAccepted');
module.exports = exports['default'];