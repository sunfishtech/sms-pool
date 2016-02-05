import { Reader } from 'ramda-fantasy';
import { STATUS as SmsMessageStatus, setStatus } from '../messages/sms-message';
import { Observable } from 'rx';
import { curry } from 'ramda';

export default function MessageSender() {
  return Reader(env => {
    const limit = env.rateLimiter.limit('from');
    const send = env.smsApi.sendMessage;
    const setVendorId = curry((message, vendorId) =>
      message.set('vendorId', vendorId)
    );

    return {
      /* :: SmsMessage -> Observable SmsMessage */
      sendMessage: (message) =>
        Observable.just(message)
          .flatMap(limit)
          .flatMap(send)
          .map(setVendorId(message))
          .map(setStatus(SmsMessageStatus.SENT))
    };
  });
}
