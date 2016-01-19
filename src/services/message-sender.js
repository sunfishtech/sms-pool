import { Reader } from 'ramda-fantasy';
import { promiseToFuture } from '../utils';

/* :: SmsMessage -> SmsApi -> Future Error String */
function sendMessage(message, smsApi) {
  return promiseToFuture(smsApi.sendMessage, message);
}

export default function MessageSender() {
  return Reader(env => {
    return {
      /* :: SmsMessage -> Future Error SmsMessage */
      sendMessage: (message) => sendMessage(message, env.smsApi)
        .map(_ => message)
    };
  });
}
