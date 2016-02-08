import { string } from 'joi';
import { Schema, ensureValidObject } from '../../utils';
import path from 'path';
import levelup from 'level';
import { Observable } from 'rx';
import SmsMessage from '../../messages/sms-message';

const LevelDbConfig = Schema({
  dataDir: string().default('./data'),
  dbName: string().default('message_queue')
});
const ensureConfig = ensureValidObject(LevelDbConfig, {});

export default function LevelDbQueue(_config = {}) {
  const config = ensureConfig(_config);
  const dbFile = path.join(config.dataDir, config.dbName);
  let _db;

  const enqueue = (message) => {
    const data = message.toJS ? message.toJS() : message;

    return Observable.fromNodeCallback(_db.put.bind(_db))(data.id, data)
      .map(_ => message);
  };

  const isInQueue = (id) =>
    Observable.fromNodeCallback(_db.get.bind(_db))(id)
      .catch(err => err.notFound ? Observable.just(false) : Observable.throw(err))
      .map(ok => !!ok);

  const ack = (message) =>
    Observable.fromNodeCallback(_db.del.bind(_db))(message.id)
      .map(_ => message);

  const purgeQueue = () => Observable.create(observer => {
    _db.createKeyStream()
      .on('data', (key) => _db.del(key))
      .on('end', () => { observer.onNext(true); observer.onCompleted(); })
      .on('error', (err) => observer.onError(err));
  });

  const inFlight = () => Observable.create(observer => {
    _db.createValueStream()
      .on('data', (m) => observer.onNext(m))
      .on('error', (e) => observer.onError(e))
      .on('end', () => observer.onCompleted());
  }).map(SmsMessage);

  return {
    init: () => _db = levelup(dbFile, {valueEncoding: 'json'}),
    dispose: () => { if (_db) _db.close(); },
    /* :: { messageId: String, queue: String } -> Promise { messageId: String, queue: String } */
    enqueueMessage: enqueue,
    /* :: { messageId: String, queue: String } -> Promise Boolean */
    ackMessage: ack,
    /* :: () -> Observable Message */
    inFlightMessages: inFlight,
    /* :: String -> Promise Boolean Error */
    isInQueue: isInQueue,
    /* :: () -> Promise Boolean Error */
    purge: purgeQueue
  };
}
