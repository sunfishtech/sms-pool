import uuid from 'uuid';
import { List } from 'immutable';

export default function MockProvider() {
  let _sentMessages = List();
  const numbers = ['num1', 'num2', 'num3', 'num4'];

  return {
    getAvailableNumbers: () => Promise.resolve(numbers),
    sendMessage: (message) => {
      _sentMessages.push(message);
      return Promise.resolve(uuid.v4());
    },
    sendMessages: _sentMessages
  };
}
