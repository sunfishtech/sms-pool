import { Subject, Observable } from 'rx';
import MemoryCache from './cache';

export default function EventBus() {
  const DEFAULT_TOPIC = '__default__';
  const topics = MemoryCache();

  const createTopic = (topic) => new Subject();
  const getTopic = (topic) => topics.get(topic, () => createTopic(topic));

  const publishMessage = (message, topic = DEFAULT_TOPIC) => {
    getTopic(DEFAULT_TOPIC).onNext(message);
    if (topic !== DEFAULT_TOPIC) getTopic(topic).onNext(message);
    return Observable.just(message);
  };

  const throwError = (error, topic = DEFAULT_TOPIC) => {
    getTopic(DEFAULT_TOPIC).onError(error);
    if (topic !== DEFAULT_TOPIC) getTopic(topic).onError(error);
    return Observable.just(error);
  };

  const subscribeToTopic = (topic, onMessage, onErr, onComplete) =>
    getTopic(topic).subscribe(onMessage, onErr, onComplete);

  return {
    /* :: Object -> String -> Observable Object */
    publish: publishMessage,
    /* :: Error -> Observable Error */
    throw: throwError,
    /* :: String -> (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribe: (topic, onMessage, onErr, onComplete) =>
      subscribeToTopic(topic, onMessage, onErr, onComplete),
    /* :: (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribeAll: (onMessage, onErr, onComplete) =>
      subscribeToTopic(DEFAULT_TOPIC, onMessage, onErr, onComplete)
  };
}
