import { Reader } from 'ramda-fantasy';
import { promiseToFuture } from '../utils';
import { curry } from 'ramda';

/* :: String -> Object -> Future Error Object */
function publishEvent(topic, evt, eventBus) {
  return promiseToFuture(eventBus.publish, evt, topic);
}

export default function EventPublisher() {
  return Reader(env => {
    return {
      /* :: String -> Object -> Future Error Object */
      publish: curry((topic, evt) =>
        publishEvent(topic, evt, env.eventBus)
      ),
      /* :: Object -> Future Error Object */
      broadcast: (evt) => publishEvent(undefined, evt, env.eventBus)
    };
  });
}
