'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STATUS = undefined;

var _typedImmutable = require('typed-immutable');

var STATUS = exports.STATUS = {
  REQUESTED: 'REQUESTED',
  ENQUEUED: 'ENQUEUED',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED'
};

exports.default = (0, _typedImmutable.Record)({
  id: String,
  to: String,
  message: String,
  status: String(STATUS.REQUESTED),
  /* Optional Fields */
  from: (0, _typedImmutable.Maybe)(String),
  callbackUrl: (0, _typedImmutable.Maybe)(String)
}, 'SmsMessage');