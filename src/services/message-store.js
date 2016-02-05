import { Reader } from 'ramda-fantasy';
import R from 'ramda';
import { SmsMessage } from '../messages';

export default function MessageStore() {
  return Reader(env => {
    return {
      /* :: SmsMessage -> Future Error MessageEnqueued */
      storeMessage: (message) => env.messageStore.put(message)
        .map(_ => message),

      /* :: String -> Future Error SmsMessage */
      getMessage: (messageId) => env.messageStore.get(messageId)
        .map(R.pick(['id', 'from', 'to', 'message', 'status', 'callbackUrl']))
        .map(SmsMessage)
    };
  });
}
