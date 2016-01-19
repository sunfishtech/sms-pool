import { Reader } from 'ramda-fantasy';
import R from 'ramda';
import { promiseToFuture } from '../utils';
import { SmsMessage } from '../messages';

/* :: SmsMessage -> MessageStore -> Future Error Unit */
function storeMessage(message, messageStore) {
  return promiseToFuture(messageStore.put, message);
}

/* :: MessageTag -> MessageStore -> Object */
function getMessage(messageId, messageStore) {
  return promiseToFuture(messageStore.get, messageId);
}

export default function MessageStore() {
  return Reader(env => {
    return {
      /* :: SmsMessage -> Future Error MessageEnqueued */
      storeMessage: (message) => storeMessage(message, env.messageStore)
        .map(_ => message),

      /* :: String -> Future Error SmsMessage */
      getMessage: (messageId) => getMessage(messageId, env.messageStore)
        .map(R.pick(['id', 'from', 'to', 'message', 'status', 'callbackUrl']))
        .map(SmsMessage)
    };
  });
}
