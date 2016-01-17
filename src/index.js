import { Reader } from 'ramda-fantasy';
import { List } from 'immutable';
import { promiseToFuture } from './utils';
import * as messages from './messages';
import * as vendors from './vendors';

/**
 * Env :: { smsApi: SmsApi }
 *  SmsApi.getAvailableNumbers :: () -> Future Error (Array String)
 *  SmsApi.sendMessage :: Object { from: String, to: String, message: String} -> Future Error String
 */

/*
  () -> Reader Env (Future Error AvailableNumbers)
*/
export function fetchAvailableNumbers() {
  return Reader(env =>
      promiseToFuture(env.smsApi.getAvailableNumbers)
        .map((numbers) =>
          new messages.AvailableNumbers({ numbers: List(numbers) })
    )
  );
}

/*
  SmsMessage -> Future Error MessageAccepted })
*/
export function sendMessage(message) {
  return Reader(env =>
    promiseToFuture(env.smsApi.sendMessage, message)
      .map((id) =>
        new messages.MessageAccepted({messageId: message.id, vendorId: id})
      )
  );
}

export const Messages = messages;
