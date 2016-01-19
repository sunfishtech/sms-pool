import R from 'ramda';
import { Future } from 'ramda-fantasy';
import Pipeline from '../pipeline';
import MessageQueue from '../services/message-queue';
import MessageStore from '../services/message-store';
import MessageSender from '../services/message-sender';

const extractId = R.compose(Future.of, R.prop(['messageId']));

/* :: Reader Env (() -> (Future Error SmsMessage)) */
export default Pipeline({
  with: [MessageQueue, MessageStore, MessageSender],
  yield: (queue, store, sender) => [
    queue.dequeueMessage,
    extractId,
    store.getMessage,
    sender.sendMessage,
    queue.ackMessage,
    store.storeMessage
  ]
});
