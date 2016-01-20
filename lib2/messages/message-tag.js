'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typedImmutable = require('typed-immutable');

exports.default = (0, _typedImmutable.Record)({
  messageId: String,
  queue: String
}, 'MessageTag');
module.exports = exports['default'];