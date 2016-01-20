
import R from 'ramda';

export default function MemoryStore() {
  // store methods
  const _store = {};
  const putMessage = (message) => _store[message.id] = message;
  const getMessage = (id) => _store[id];

  // util
  const toPromise = val => Promise.resolve(val);
  const promise = fn => R.compose(toPromise, fn);

  return {
    /* :: {messageId: String, ...} -> Boolean */
    put: promise(putMessage),
    /* :: String -> Object */
    get: promise(getMessage)
  };
}
