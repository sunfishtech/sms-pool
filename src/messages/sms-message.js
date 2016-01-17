import { Record, Maybe } from 'typed-immutable';

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
  callbackUrl: Maybe(String)
});

