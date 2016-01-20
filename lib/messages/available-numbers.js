'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typedImmutable = require('typed-immutable');

exports.default = (0, _typedImmutable.Record)({
  numbers: new _typedImmutable.List(String)()
}, 'AvailableNumbers');
module.exports = exports['default'];