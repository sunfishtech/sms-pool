import { Reader, Future } from 'ramda-fantasy';
import { promiseToFuture } from '../utils';

/* :: SmsMessage -> SmsApi -> Future Error String */
function sendMessage(message, smsApi) {
  return promiseToFuture(smsApi.sendMessage, message);
}

function throttledSendMessage(message, smsApi, rateLimiter) {
  return Future((_, respond) => {
    rateLimiter.limit(message.from, respond);
  }).chain(_ => sendMessage(message, smsApi));
}

export default function MessageSender() {
  return Reader(env => {
    const limiter = env.rateLimiter;

    return {
      /* :: SmsMessage -> Future Error SmsMessage */
      sendMessage: (message) => throttledSendMessage(message, env.smsApi, limiter)
        .map(_ => message)
    };
  });
}
