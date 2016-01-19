import { Reader } from 'ramda-fantasy';
import R from 'ramda';
import { promiseToFuture } from '../utils';
import { MessageTag } from '../messages';

/* :: SmsMessage -> MessageQueue -> Future Error Unit */
function enqueueMessage(message, queue) {
  return promiseToFuture(queue.enqueueMessage, message);
}

/* :: () -> Promise Object Error */
function dequeueMessage(queue) {
  return promiseToFuture(queue.dequeueMessage);
}

/* :: SmsMessage -> Promise Object Error */
function ackMessage(message, queue) {
  return promiseToFuture(queue.ackMessage, message);
}

export default function MessageQueue() {
  return Reader(env => {
    return {
      /* :: SmsMessage -> Future Error SmsMessage */
      enqueueMessage: (message) => enqueueMessage(message, env.messageQueue)
        .map(_ => message),

      /* :: () -> Future Error MessageTag */
      dequeueMessage: () => dequeueMessage(env.messageQueue)
        .map(R.pick(['messageId'])).map(MessageTag),

      /* :: SmsMessage -> Future Error SmsMessage */
      ackMessage: (message) => ackMessage(message, env.messageQueue)
        .map(_ => message)
    };
  });
}
