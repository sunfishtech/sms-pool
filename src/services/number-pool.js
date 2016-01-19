import { Reader, Future } from 'ramda-fantasy';
import { promiseToFuture } from '../utils';
import { List } from 'immutable';
import NodeRing from 'consistent-hashing';
import R from 'ramda';
import { AvailableNumbers } from '../messages';

/* :: NodeRing -> String -> String */
const lookupNumber = R.curry((key, nodeRing) =>
  nodeRing.getNode(key)
);

/* :: NodeRing -> Message -> Message */
const ensureFromField = R.curry((message, nodeRing) =>
  R.ifElse(
    R.prop('from'),
    R.identity,
    (msg) => msg.set('from', lookupNumber(msg.to, nodeRing))
  )(message)
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
function createNumberPool(smsApi) {
  return fetchAvailableNumbers(smsApi).map(createNodeRing);
}

export default function NumberPool() {
  const NP_CACHE_KEY = 'NumberPool.numberPool';

  return Reader(env => {
    // this will need to become a var or let when the API get an addPhoneNumbe method
    const numberPool = env.cache.get(NP_CACHE_KEY,
      () => Future.cache(createNumberPool(env.smsApi))
    );

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
