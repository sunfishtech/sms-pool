'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SmsApi = undefined;

var _typedImmutable = require('typed-immutable');

var _types = require('../types');

var SmsApi = exports.SmsApi = (0, _typedImmutable.Record)({

  /* () -> Promise (List String) Error */
  getAvailableNumbers: _types.Fn,

  /*  SmsMessage -> Promise MessageAccepted Error */
  sendMessage: _types.Fn
});