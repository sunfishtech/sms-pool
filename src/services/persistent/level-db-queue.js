import { string } from 'joi';
import { Schema, ensureValidObject } from '../../utils';
import path from 'path';
import levelup from 'level';
import { Subject, Observable } from 'rx';

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

    return Observable.fromNodeCallback(_db.put.bind(_db))(data.id, data)
      .map(_ => broadcastMessage(message));
  };

  const isInQueue = (id) =>
    Observable.fromNodeCallback(_db.get.bind(_db))(id)
      .catch(err => err.notFound ? Observable.just(false) : Observable.throw(err))
      .map(ok => !!ok);

  const ack = (message) =>
    Observable.fromNodeCallback(_db.del.bind(_db))(message.id);

  const purgeQueue = () => Observable.create(observer => {
    _db.createKeyStream()
      .on('data', (key) => _db.del(key))
      .on('end', () => observer.onNext(true))
      .on('error', (err) => observer.onError(err));
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
