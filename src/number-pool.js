import { Reader, Future, Maybe } from 'ramda-fantasy';
import { AvailableNumbers } from './messages';
import { promiseToFuture } from './utils';
import { List } from 'immutable';
import NodeRing from 'consistent-hashing';
import R from 'ramda';


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
function createNodeRing(numbers){
  return new NodeRing(numbers);
}

/* :: SmsApi -> Future Error AvailableNumbers */
function fetchAvailableNumbers(smsApi) {
  return promiseToFuture(smsApi.getAvailableNumbers)
}

/* :: SmsApi -> Future Error NodeRing */
function createNumberPool(smsApi) {
  return fetchAvailableNumbers(smsApi).map(createNodeRing);
}

export default function NumberPool() {
  return Reader(env => {
    //this will need to become a var or let when the API get an addPhoneNumbe method
    const numberPool = Future.cache(createNumberPool(env.smsApi));

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


