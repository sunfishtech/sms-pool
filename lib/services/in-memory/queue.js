'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MemoryQueue;

var _rx = require('rx');

function MemoryQueue() {
  var subject = new _rx.Subject();

  return {
    /* :: SmsMessage -> Observable Message */
    enqueueMessage: function enqueueMessage(message) {
      return _rx.Observable.create(function (observer) {
        subject.onNext(message);observer.onNext(message);
      });
    },
    /* :: SmsMessage -> Observable SmsMessage */
    ackMessage: function ackMessage(message) {
      return _rx.Observable.just(message);
    }, // NOOP
    /* :: (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribe: function subscribe(onMessage, onErr, onComplete) {
      return subject.subscribe(onMessage, onErr, onComplete);
    }
  };
}
module.exports = exports['default'];