import { Reader } from 'ramda-fantasy';
import { curry } from 'ramda';

export default function EventPublisher() {
  return Reader(env => {
    return {
      /* :: String -> Object -> Observable Object */
      publish: curry((topic, evt) => env.eventBus.publish(evt, topic)),
      /* :: Object -> Observable Object */
      broadcast: (evt) => env.eventBus.publish(evt)
    };
  });
}
