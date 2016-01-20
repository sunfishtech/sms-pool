import { Map } from 'immutable';

export default function MemoryCache() {
  let _cache = Map();
  const _mutate = (op, ...args) => { _cache = _cache[op](...args); return true; };

  return {
    get: (key, fn) => _cache.has(key) ?
      _cache.get(key) :
      _mutate('set', key, fn()) && _cache.get(key),
    set: (key, val) => _mutate('set', key, val),
    remove: (key) => _mutate('remove', key),
    clear: (key) => _mutate('clear'),
    has: (key) => _cache.has(key)
  };
}
