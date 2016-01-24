'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventBus;

var _rx = require('rx');

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _ramda = require('ramda');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function EventBus() {
  var DEFAULT_TOPIC = '__default__';
  var topics = (0, _cache2.default)();

  var createTopic = function createTopic(topic) {
    return new _rx.Subject();
  };
  var getTopic = function getTopic(topic) {
    return topics.get(topic, function () {
      return createTopic(topic);
    });
  };

  var publishMessage = function publishMessage(message) {
    var topic = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_TOPIC : arguments[1];

    getTopic(DEFAULT_TOPIC).onNext(message);
    if (topic !== DEFAULT_TOPIC) getTopic(topic).onNext(message);
    return message;
  };

  var publishError = function publishError(error) {
    var topic = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_TOPIC : arguments[1];

    getTopic(DEFAULT_TOPIC).onError(error);
    if (topic !== DEFAULT_TOPIC) getTopic(topic).onError(error);
    return error;
  };

  var subscribeToTopic = function subscribeToTopic(topic, onMessage, onErr, onComplete) {
    return getTopic(topic).subscribe(onMessage, onErr, onComplete);
  };

  /* util funcs */
  var toPromise = function toPromise(val) {
    return Promise.resolve(val);
  };
  var promise = function promise(fn) {
    return (0, _ramda.compose)(toPromise, fn);
  };

  return {
    /* :: Object -> String -> Promise Object Error */
    publish: promise(publishMessage),
    /* :: Error -> Promise Error Error */
    publishError: promise(publishError),
    /* :: String -> (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribe: function subscribe(topic, onMessage, onErr, onComplete) {
      return subscribeToTopic(topic, onMessage, onErr, onComplete);
    },
    /* :: (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribeAll: function subscribeAll(onMessage, onErr, onComplete) {
      return subscribeToTopic(DEFAULT_TOPIC, onMessage, onErr, onComplete);
    }
  };
}
module.exports = exports['default'];