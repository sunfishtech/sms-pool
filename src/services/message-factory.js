import { Reader } from 'ramda-fantasy';
import { curry, assoc, is } from 'ramda';
import { Observable } from 'rx';

const appendId = (idField, idGen, data) => assoc(idField, idGen.next(), data);

const createMessage = (messageType, idField, idGen, message) => {
  const data = is(String, idField) ?
    appendId(idField, idGen, message) : message;

  return Observable.just(data).map(messageType);
};

export default function MessageFactory() {
  return Reader(env => {
    return {
      create: curry(
        (messageType, idField, message) =>
          createMessage(messageType, idField, env.idGenerator, message)
      )
    };
  });
}
