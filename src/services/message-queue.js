import { Reader } from 'ramda-fantasy';
import { STATUS as MessageStatus, setStatus } from '../messages/sms-message';

export default function MessageQueue() {
  return Reader(env => {
    return {
      /* :: SmsMessage -> Observable SmsMessage */
      enqueueMessage: (message) => env.messageQueue
        .enqueueMessage(message)
        .map(setStatus(MessageStatus.ENQUEUED)),

      /* :: SmsMessage -> Future Error SmsMessage */
      ackMessage: (message) => env.messageQueue
        .ackMessage(message),

      getInFlightMessages: env.messageQueue.inFlightMessages
    };
  });
}
