import { Observable } from 'rx';
import Pipeline from '../pipeline';
import EventPublisher from '../services/event-publisher';
import { MessageEnqueued } from '../messages';
import EVENT_TOPICS from '../event-topics';

const messageToEvent = (message) => Observable.just(
  new MessageEnqueued({message: message})
);

export default Pipeline({
  with: [EventPublisher],
  yield: (evts) => [
    messageToEvent,
    evts.publish(EVENT_TOPICS.ENQUEUED_MESSAGES)
  ]
});
