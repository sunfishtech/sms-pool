'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MemoryQueue;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _rx = require('rx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function MemoryQueue() {
  var subject = new _rx.Subject();
  var enqueue = function enqueue(message) {
    subject.onNext(message);return message;
  };

  /* util funcs */
  var toPromise = function toPromise(val) {
    return Promise.resolve(val);
  };
  var promise = function promise(fn) {
    return _ramda2.default.compose(toPromise, fn);
  };

  return {
    /* :: { messageId: String, queue: String } -> Promise { messageId: String, queue: String } */
    enqueueMessage: promise(enqueue),
    /* :: { messageId: String, queue: String } -> Promise Boolean */
    ackMessage: promise(_ramda2.default.identity), // NOOP
    /* :: (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribe: function subscribe(onMessage, onErr, onComplete) {
      return subject.subscribe(onMessage, onErr, onComplete);
    }
  };
}
module.exports = exports['default'];