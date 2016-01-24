import { string } from 'joi';
import { Schema, ensureValidObject, callbackToPromise } from '../../utils';
import path from 'path';
import levelup from 'level';
import { Subject } from 'rx';

const LevelDbConfig = Schema({
  dataDir: string().default('./data'),
  dbName: string().default('message_queue')
});
const ensureConfig = ensureValidObject(LevelDbConfig, {});

export default function LevelDbQueue(_config = {}) {
  const config = ensureConfig(_config);
  const dbFile = path.join(config.dataDir, config.dbName);
  const subject = new Subject();
  let _db;

  const broadcastMessage = (message) => { subject.onNext(message); return message; };

  const enqueue = (message) => {
    const data = message.toJS ? message.toJS() : message;

    return callbackToPromise(_db.put.bind(_db), data.id, data)
      .then(_ => broadcastMessage(message));
  };

  const isInQueue = (id) =>
    callbackToPromise(_db.get.bind(_db), id).then((ok) => true, (err) =>
      err.notFound ? false : Promise.reject(err)
    );

  const ack = (message) =>
    callbackToPromise(_db.del.bind(_db), message.id);

  const purgeQueue = () => new Promise((resolve, reject) => {
    _db.createKeyStream()
      .on('data', (key) => _db.del(key))
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err));
  });

  const requeueAll = () =>
    _db.createValueStream()
      .on('data', broadcastMessage);

  return {
    init: () => _db = levelup(dbFile, {valueEncoding: 'json'}),
    start: () => requeueAll(),
    dispose: () => { if (_db) _db.close(); },
    /* :: { messageId: String, queue: String } -> Promise { messageId: String, queue: String } */
    enqueueMessage: enqueue,
    /* :: { messageId: String, queue: String } -> Promise Boolean */
    ackMessage: ack, 
    /* :: (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribe: (onMessage, onErr, onComplete) => subject.subscribe(onMessage, onErr, onComplete),
    /* :: String -> Promise Boolean Error */
    isInQueue: isInQueue,
    /* :: () -> Promise Boolean Error */
    purge: purgeQueue
  };
}
