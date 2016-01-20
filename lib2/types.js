'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Fn = undefined;

var _typedImmutable = require('typed-immutable');

var Fn = exports.Fn = (0, _typedImmutable.Typed)('Fn', function (value) {
  return typeof value === 'function' ? value : TypeError('"' + value + '" is not a function');
});