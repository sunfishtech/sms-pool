import { Observable } from 'rx';
import Pipeline from '../pipeline';
import NumberPool from '../services/number-pool';
import MessageQueue from '../services/message-queue';
import MessageStore from '../services/message-store';
import MessageFactory from '../services/message-factory';
import SmsMessage from '../messages/sms-message';
import EventPublisher from '../services/event-publisher';
import MessageEnqueued from '../messages/message-enqueued';
import EVENT_TOPICS from '../event-topics';

const messageToEvent = (message) => Observable.just(
  new MessageEnqueued({message: message})
);

export default Pipeline({
  with: [MessageFactory, NumberPool, MessageStore, MessageQueue, EventPublisher],
  yield: (message, pool, store, queue, evts) => [
    message.create(SmsMessage, 'id'),
    pool.appendFromIfMissing,
    queue.enqueueMessage,
    store.storeMessage,
    messageToEvent,
    evts.publish(EVENT_TOPICS.ENQUEUED_MESSAGES)
  ]
});
