'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Limiter;

var _limiter = require('limiter');

var _inMemory = require('../services/in-memory');

function Limiter() {
  var max = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var window = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];

  var _limiters = new _inMemory.MemoryCache();
  /* Toll free numbers allow 3 per second - this could be enhanced
     to detect toll free numbers and alter the limit args accordingly */
  var getLimiter = function getLimiter(key) {
    return _limiters.get(key, function () {
      return new _limiter.RateLimiter(max, window);
    });
  };

  return {
    limit: function limit(key, callback) {
      return getLimiter(key).removeTokens(1, callback);
    }
  };
}
module.exports = exports['default'];