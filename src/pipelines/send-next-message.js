import { Observable } from 'rx';
import Pipeline from '../pipeline';
import MessageQueue from '../services/message-queue';
import MessageStore from '../services/message-store';
import MessageSender from '../services/message-sender';
import EventPublisher from '../services/event-publisher';
import MessageAccepted from '../messages/message-accepted';
import EVENT_TOPICS from '../event-topics';

const messageToEvent = (message) => Observable.just(
  new MessageAccepted({message: message})
);

/* :: Reader Env (() -> (Future Error SmsMessage)) */
export default Pipeline({
  with: [MessageQueue, MessageStore, MessageSender, EventPublisher],
  yield: (queue, store, sender, evts) => [
    sender.sendMessage,
    queue.ackMessage,
    store.storeMessage,
    messageToEvent,
    evts.publish(EVENT_TOPICS.SENT_MESSAGES)
  ]
});
