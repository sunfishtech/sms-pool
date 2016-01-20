
import R from 'ramda';
import { Subject } from 'rx';

export default function MemoryQueue() {
  const subject = new Subject();
  const enqueue = (message) => { subject.onNext(message); return message; };

  /* util funcs */
  const toPromise = val => Promise.resolve(val);
  const promise = fn => R.compose(toPromise, fn);

  return {
    /* :: { messageId: String, queue: String } -> Promise { messageId: String, queue: String } */
    enqueueMessage: promise(enqueue),
    /* :: { messageId: String, queue: String } -> Promise Boolean */
    ackMessage: promise(R.identity), // NOOP
    /* :: (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribe: (onMessage, onErr, onComplete) => subject.subscribe(onMessage, onErr, onComplete)
  };
}
