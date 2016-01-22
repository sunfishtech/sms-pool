import { Subject } from 'rx';
import MemoryCache from './cache';
import { compose } from 'ramda';

export default function EventBus() {
  const DEFAULT_TOPIC = '__default__';
  const topics = MemoryCache();

  const createTopic = (topic) => new Subject();
  const getTopic = (topic) => topics.get(topic, () => createTopic(topic));

  const publishMessage = (message, topic = DEFAULT_TOPIC) => {
    getTopic(DEFAULT_TOPIC).onNext(message);
    if (topic !== DEFAULT_TOPIC) getTopic(topic).onNext(message);
    return message;
  };

  const publishError = (error, topic = DEFAULT_TOPIC) => {
    getTopic(DEFAULT_TOPIC).onError(error);
    if (topic !== DEFAULT_TOPIC) getTopic(topic).onError(error);
    return error;
  };

  const subscribeToTopic = (topic, onMessage, onErr, onComplete) =>
    getTopic(topic).subscribe(onMessage, onErr, onComplete);

  /* util funcs */
  const toPromise = val => Promise.resolve(val);
  const promise = fn => compose(toPromise, fn);

  return {
    /* :: Object -> String -> Promise Object Error */
    publish: promise(publishMessage),
    /* :: Error -> Promise Error Error */
    publishError: promise(publishError),
    /* :: String -> (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribe: (topic, onMessage, onErr, onComplete) =>
      subscribeToTopic(topic, onMessage, onErr, onComplete),
    /* :: (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribeAll: (onMessage, onErr, onComplete) =>
      subscribeToTopic(DEFAULT_TOPIC, onMessage, onErr, onComplete)
  };
}
