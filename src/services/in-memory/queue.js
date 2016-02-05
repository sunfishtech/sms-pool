import { Subject } from 'rx';
import { Observable } from 'rx';

export default function MemoryQueue() {
  const subject = new Subject();

  return {
    /* :: SmsMessage -> Observable Message */
    enqueueMessage: (message) => Observable.create(observer => {
      subject.onNext(message); observer.onNext(message);
    }),
    /* :: SmsMessage -> Observable SmsMessage */
    ackMessage: (message) => Observable.just(message), // NOOP
    /* :: (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribe: (onMessage, onErr, onComplete) => subject.subscribe(onMessage, onErr, onComplete)
  };
}
