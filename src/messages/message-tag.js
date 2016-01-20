import { Record } from 'typed-immutable';

export default Record({
  messageId: String,
  queue: String
}, 'MessageTag');

