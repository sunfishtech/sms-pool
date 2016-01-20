import { Reader, Future } from 'ramda-fantasy';
import { promiseToFuture } from '../utils';
import { List } from 'immutable';
import NodeRing from 'consistent-hashing';
import R from 'ramda';
import { AvailableNumbers } from '../messages';
import { MemoryCache } from '../services/in-memory';

const NP_CACHE_KEY = 'NumberPool.available_numbers';

/* :: NodeRing -> String -> String */
const lookupNumber = R.curry((key, nodeRing) =>
  nodeRing.getNode(key)
);

/* :: NodeRing -> Message -> Message */
const ensureFromField = R.curry((message, nodeRing) =>
  message.from ? message :
    message.set('from', lookupNumber(message.to, nodeRing))
);

/* :: -> String -> Cache -> Value */
const cacheValue = R.curry((key, cache, value) =>
  R.tap(v => cache.set(key, v), value)
);

/* :: Array String -> NodeRing */
function createNodeRing(numbers) {
  return new NodeRing(numbers);
}

/* :: SmsApi -> Future Error AvailableNumbers */
function fetchAvailableNumbers(smsApi) {
  return promiseToFuture(smsApi.getAvailableNumbers);
}

/* :: SmsApi -> Future Error NodeRing */
function createNumberPool(smsApi, cache) {
  const nums =
    R.ifElse(
      k => cache.has(k) && R.is(Array, cache.get(k)),
      k => Future.of(cache.get(k)),
      k => fetchAvailableNumbers(smsApi).map(cacheValue(k, cache))
    );

  return Future.of(NP_CACHE_KEY).chain(nums).map(createNodeRing);
}

export default function NumberPool() {
  const _cache = new MemoryCache();

  return Reader(env => {
    const numberPool = createNumberPool(env.smsApi, env.cache || _cache);

    return {
      /* :: () -> Future Error AvailableNumbers */
      availableNumbers: () => numberPool.map(R.prop('nodes')).map((numbers) =>
        new AvailableNumbers({ numbers: List(numbers) })
      ),
      /* :: SmsMessage -> Future Error SmsMessage */
      appendFromIfMissing: (message) => numberPool.map(ensureFromField(message))
    };
  });
}
