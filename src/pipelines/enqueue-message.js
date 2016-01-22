import Pipeline from '../pipeline';
import NumberPool from '../services/number-pool';
import MessageQueue from '../services/message-queue';
import MessageStore from '../services/message-store';
import MessageFactory from '../services/message-factory';
import SmsMessage from '../messages/sms-message';

export default Pipeline({
  with: [MessageFactory, NumberPool, MessageStore, MessageQueue],
  yield: (message, pool, store, queue) => [
    message.create(SmsMessage, 'id'),
    pool.appendFromIfMissing,
    queue.enqueueMessage,
    store.storeMessage
  ]
});
