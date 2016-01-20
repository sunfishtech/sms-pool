import { RateLimiter } from 'limiter';
import { MemoryCache } from '../services/in-memory';

export default function Limiter(max = 1, window = 1000) {
  const _limiters = new MemoryCache();
  /* Toll free numbers allow 3 per second - this could be enhanced
     to detect toll free numbers and alter the limit args accordingly */
  const getLimiter = (key) => _limiters.get(key, () => new RateLimiter(max, window));

  return {
    limit: (key, callback) => getLimiter(key).removeTokens(1, callback)
  };
}