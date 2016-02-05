'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = NumberPool;

var _ramdaFantasy = require('ramda-fantasy');

var _immutable = require('immutable');

var _consistentHashing = require('consistent-hashing');

var _consistentHashing2 = _interopRequireDefault(_consistentHashing);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _messages = require('../messages');

var _inMemory = require('../services/in-memory');

var _rx = require('rx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NP_CACHE_KEY = 'NumberPool.available_numbers';

/* :: NodeRing -> String -> String */
var lookupNumber = _ramda2.default.curry(function (key, nodeRing) {
  return nodeRing.getNode(key);
});

/* :: NodeRing -> Message -> Message */
var ensureFromField = _ramda2.default.curry(function (message, nodeRing) {
  return message.from ? message : message.set('from', lookupNumber(message.to, nodeRing));
});

/* :: -> String -> Cache -> Value */
var cacheValue = _ramda2.default.curry(function (key, cache, value) {
  return _ramda2.default.tap(function (v) {
    return cache.set(key, v);
  }, value);
});

/* :: Array String -> NodeRing */
function createNodeRing(numbers) {
  return new _consistentHashing2.default(numbers);
}

/* :: SmsApi -> Future Error NodeRing */
function createNumberPool(smsApi, cache) {
  var nums = _ramda2.default.ifElse(function (k) {
    return cache.has(k) && _ramda2.default.is(Array, cache.get(k));
  }, function (k) {
    return _rx.Observable.just(cache.get(k));
  }, function (k) {
    return smsApi.getAvailableNumbers().map(cacheValue(k, cache));
  });

  return _rx.Observable.just(NP_CACHE_KEY).flatMap(nums).map(createNodeRing);
}

function NumberPool() {
  var _cache = new _inMemory.MemoryCache();

  return (0, _ramdaFantasy.Reader)(function (env) {
    var numberPool = createNumberPool(env.smsApi, env.cache || _cache);

    return {
      /* :: () -> Future Error AvailableNumbers */
      availableNumbers: function availableNumbers() {
        return numberPool.map(_ramda2.default.prop('nodes')).map(function (numbers) {
          return new _messages.AvailableNumbers({ numbers: (0, _immutable.List)(numbers) });
        });
      },
      /* :: SmsMessage -> Future Error SmsMessage */
      appendFromIfMissing: function appendFromIfMissing(message) {
        return numberPool.map(ensureFromField(message));
      }
    };
  });
}
module.exports = exports['default'];