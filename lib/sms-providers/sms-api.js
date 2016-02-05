'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SmsApi = undefined;

var _typedImmutable = require('typed-immutable');

var _types = require('../types');

var SmsApi = exports.SmsApi = (0, _typedImmutable.Record)({

  /* () -> Observable (List String) */
  getAvailableNumbers: _types.Fn,

  /*  SmsMessage ->  Observable SmsMessage */
  sendMessage: _types.Fn
});