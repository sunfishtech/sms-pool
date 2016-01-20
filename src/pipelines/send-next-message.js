import Pipeline from '../pipeline';
import MessageQueue from '../services/message-queue';
import MessageStore from '../services/message-store';
import MessageSender from '../services/message-sender';

/* :: Reader Env (() -> (Future Error SmsMessage)) */
export default Pipeline({
  with: [MessageQueue, MessageStore, MessageSender],
  yield: (queue, store, sender) => [
    sender.sendMessage,
    queue.ackMessage,
    store.storeMessage
  ]
});
