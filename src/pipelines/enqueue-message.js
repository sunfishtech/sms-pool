import Pipeline from '../pipeline';
import NumberPool from '../services/number-pool';
import MessageQueue from '../services/message-queue';
import MessageStore from '../services/message-store';

export default Pipeline({
  with: [NumberPool, MessageStore, MessageQueue],
  yield: (pool, store, queue) => [
    pool.appendFromIfMissing,
    store.storeMessage,
    queue.enqueueMessage
  ]
});
