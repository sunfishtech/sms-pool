import { Observable } from 'rx';

export default function MemoryStore() {
  // store methods
  const _store = {};
  const putMessage = (message) => _store[message.id] = message;
  const getMessage = (id) => _store[id];

  return {
    /* :: SmsMessage -> SmsMessage */
    put: message => Observable.just(message).do(putMessage).map(_=>message),
    /* :: String -> SmsMessage */
    get: id => Observable.just(id).map(getMessage)
  };
}
