import { RateLimiter } from 'limiter';
import { MemoryCache } from '../services/in-memory';
import { curry } from 'ramda';
import { Observable } from 'rx';

export default function Limiter(config = {max: 1, period: 1000}) {
  const _limiters = new MemoryCache();
  /* Toll free numbers allow 3 per second - this could be enhanced
     to detect toll free numbers and alter the limit args accordingly */
  const getLimiter = (key) => _limiters.get(key, () => new RateLimiter(config.max, config.period));
  const removeTokens = (limiter) => limiter.removeTokens.bind(limiter);

  return {
    /* :: String -> Object -> Observable Object */
    limit: curry((keyField, payload) => Observable.fromCallback(
      removeTokens(getLimiter(payload[keyField]))
      )(1).map(_ => payload)
    )
  };
}
