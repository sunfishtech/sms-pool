'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MemoryQueue;

var _rx = require('rx');

var _ramda = require('ramda');

function MemoryQueue() {
  var _inFlight = [];
  var _acked = [];

  return {
    /* :: SmsMessage -> Observable Message */
    enqueueMessage: function enqueueMessage(message) {
      _inFlight.push(message);
      return _rx.Observable.just(message);
    },
    /* :: SmsMessage -> Observable SmsMessage */
    ackMessage: function ackMessage(message) {
      _acked.push(message.id);
      return _rx.Observable.just(message);
    },

    inFlightMessages: function inFlightMessages() {
      return _rx.Observable.from(_inFlight).filter(function (m) {
        return !(0, _ramda.contains)(m.id, _acked);
      });
    },

    purge: function purge() {
      _inFlight = [];_acked = [];return _rx.Observable.just(true);
    }
  };
}
module.exports = exports['default'];