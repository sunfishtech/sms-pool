import { Reader } from 'ramda-fantasy';
import { promiseToFuture } from '../utils';

/* :: SmsMessage -> MessageQueue -> Future Error Unit */
function enqueueMessage(message, queue) {
  return promiseToFuture(queue.enqueueMessage, message);
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

      /* :: SmsMessage -> Future Error SmsMessage */
      ackMessage: (message) => ackMessage(message, env.messageQueue)
        .map(_ => message)
    };
  });
}
