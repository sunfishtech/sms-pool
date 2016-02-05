import { Record } from 'typed-immutable';
import SmsMessage from './sms-message';

export default Record({
  message: SmsMessage
}, 'MessageAccepted');

