import { Record, Maybe } from 'typed-immutable';
import { curry } from 'ramda';

export const STATUS = {
  REQUESTED: 'REQUESTED',
  ENQUEUED: 'ENQUEUED',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED'
};

export default Record({
  id: String,
  to: String,
  message: String,
  status: String(STATUS.REQUESTED),
  /* Optional Fields */
  from: Maybe(String),
  callbackUrl: Maybe(String),
  vendorId: Maybe(String)
}, 'SmsMessage');

/* :: STATUS -> SmsMessage */
export const setStatus = curry((status, message) =>
  message.set('status', status)
);
