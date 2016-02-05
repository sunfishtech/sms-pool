import uuid from 'uuid';
import { Observable } from 'rx';

export default function MockProvider() {
  const _sentMessages = [];
  const numbers = ['num1', 'num2', 'num3', 'num4'];

  return {
    getAvailableNumbers: () => Observable.just(numbers),
    sendMessage: (message) => {
      _sentMessages.push(message);
      return Observable.just(uuid.v4());
    },
    sentMessages: _sentMessages
  };
}
