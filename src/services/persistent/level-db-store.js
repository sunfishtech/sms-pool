import { string } from 'joi';
import { Schema, ensureValidObject, callbackToPromise } from '../../utils';
import path from 'path';
import levelup from 'level';

const LevelDbConfig = Schema({
  dataDir: string().default('./data'),
  dbName: string().default('message_store')
});
const ensureConfig = ensureValidObject(LevelDbConfig, {});

export default function LevelDbStore(_config = {}) {
  const config = ensureConfig(_config);
  const dbFile = path.join(config.dataDir, config.dbName);
  let _db;

  // store methods
  const putMessage = (message) =>
    callbackToPromise(_db.put.bind(_db), message.id, message);

  const getMessage = (id) => callbackToPromise(_db.get.bind(_db), id);

  return {
    init: () => _db = levelup(dbFile, {valueEncoding: 'json'}),
    dispose: () => { if (_db) _db.close(); },
    /* :: {messageId: String, ...} -> Boolean */
    put: putMessage,
    /* :: String -> Object */
    get: getMessage
  };
}
