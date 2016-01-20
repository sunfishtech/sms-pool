'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MemoryCache;

var _immutable = require('immutable');

function MemoryCache() {
  var _cache = (0, _immutable.Map)();
  var _mutate = function _mutate(op) {
    var _cache2;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    _cache = (_cache2 = _cache)[op].apply(_cache2, args);return true;
  };

  return {
    get: function get(key, fn) {
      return _cache.has(key) ? _cache.get(key) : _mutate('set', key, fn()) && _cache.get(key);
    },
    set: function set(key, val) {
      return _mutate('set', key, val);
    },
    remove: function remove(key) {
      return _mutate('remove', key);
    },
    clear: function clear(key) {
      return _mutate('clear');
    },
    has: function has(key) {
      return _cache.has(key);
    }
  };
}
module.exports = exports['default'];