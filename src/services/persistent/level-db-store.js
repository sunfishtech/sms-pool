import { string } from 'joi';
import { Schema, ensureValidObject } from '../../utils';
import path from 'path';
import levelup from 'level';
import { Observable } from 'rx';

const LevelDbConfig = Schema({
  dataDir: string().default('./data'),
  dbName: string().default('message_store')
});
const ensureConfig = ensureValidObject(LevelDbConfig, {});

export default function LevelDbStore(_config = {}) {
  const config = ensureConfig(_config);
  const dbFile = path.join(config.dataDir, config.dbName);
  let _db;

  /* String -> Object -> Observable Object */
  const putMessage = (id, message) =>
    Observable.fromNodeCallback(_db.put.bind(_db))(id, message)
      .map(_ => message);
  /* :: String -> Observable Object */
  const getMessage = id =>
    Observable.fromNodeCallback(_db.get.bind(_db))(id);

  return {
    init: () => _db = levelup(dbFile, {valueEncoding: 'json'}),
    dispose: () => { if (_db) _db.close(); },
    /* :: {id:String, ...} -> Observable Object */
    put: (message) => putMessage(message.id, message),
    /* :: String -> Observable Object */
    get: (id) => getMessage(id)
  };
}
