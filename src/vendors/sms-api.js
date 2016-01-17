import { Record } from 'typed-immutable';
import { Fn } from '../types';

export const SmsApi = Record({

  /* () -> Promise (List String) Error */
  getAvailableNumbers: Fn,

  /*  SmsMessage -> Promise MessageAccepted Error */
  sendMessage: Fn
});
