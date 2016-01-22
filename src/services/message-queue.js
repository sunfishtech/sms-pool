import { Reader } from 'ramda-fantasy';
import { promiseToFuture } from '../utils';
import { STATUS as MessageStatus, setStatus } from '../messages/sms-message';

/* :: SmsMessage -> MessageQueue -> Future Error Message */
function enqueueMessage(message, queue) {
  return promiseToFuture(queue.enqueueMessage, message);
}

/* :: SmsMessage -> Future Error Object*/
function ackMessage(message, queue) {
  return promiseToFuture(queue.ackMessage, message);
}

export default function MessageQueue() {
  return Reader(env => {
    return {
      /* :: SmsMessage -> Future Error SmsMessage */
      enqueueMessage: (message) => enqueueMessage(message, env.messageQueue)
        .map(setStatus(MessageStatus.ENQUEUED)),

      /* :: SmsMessage -> Future Error SmsMessage */
      ackMessage: (message) => ackMessage(message, env.messageQueue)
        .map(_ => message)
    };
  });
}
