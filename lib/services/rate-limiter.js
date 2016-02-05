'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Limiter;

var _limiter = require('limiter');

var _inMemory = require('../services/in-memory');

var _ramda = require('ramda');

var _rx = require('rx');

function Limiter() {
  var config = arguments.length <= 0 || arguments[0] === undefined ? { max: 1, period: 1000 } : arguments[0];

  var _limiters = new _inMemory.MemoryCache();
  /* Toll free numbers allow 3 per second - this could be enhanced
     to detect toll free numbers and alter the limit args accordingly */
  var getLimiter = function getLimiter(key) {
    return _limiters.get(key, function () {
      return new _limiter.RateLimiter(config.max, config.period);
    });
  };
  var removeTokens = function removeTokens(limiter) {
    return limiter.removeTokens.bind(limiter);
  };

  return {
    /* :: String -> Object -> Observable Object */
    limit: (0, _ramda.curry)(function (keyField, payload) {
      return _rx.Observable.fromCallback(removeTokens(getLimiter(payload[keyField])))(1).map(function (_) {
        return payload;
      });
    })
  };
}
module.exports = exports['default'];