import { Record } from 'typed-immutable';
import { Fn } from '../types';

export const SmsApi = Record({

  /* () -> Observable (List String) */
  getAvailableNumbers: Fn,

  /*  SmsMessage ->  Observable SmsMessage */
  sendMessage: Fn
});
