import { Record } from 'typed-immutable';
import { Reader } from 'ramda-fantasy';
import { promiseToFuture } from './utils';
import * as messages from './messages';
import * as vendors from './vendors';
import SmsApi from './vendors/sms-api';

/**
 * Environment :: { smsApi: SmsApi,
 *  SmsApi.getAvailableNumbers :: () -> Future Error (Array String)
 *  SmsApi.sendMessage :: Object { from: String, to: String, message: String} -> Future Error String
 * )
 */
const SmsProviderConfig = Record({
  name: String,
  config: Object
});

const SmsPoolConfig = Record({
  provider: SmsProviderConfig
});

export default function SmsPool(_config = {}) {
  const config = new SmsPoolConfig(_config);
  const smsApi = null;
}

export function enqueueMessage(message) {
}

/*
  SmsMessage -> Future Error MessageAccepted
*/
export function sendMessage(message) {
  return Reader(env =>
    promiseToFuture(env.smsApi.sendMessage, message)
      .map((id) =>
        new messages.MessageAccepted({messageId: message.id, vendorId: id})
      )
  );
}

/* SmsMessage -> Reader Env (Future Error SmsMessage) */
export function enqueueMessage(message) {
  return Reader(env =>
    true
  );
}

export const Messages = messages;
