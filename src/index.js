import { Reader } from 'ramda-fantasy';
import { List } from 'immutable';

import * as messages from './messages';
import * as vendors from './vendors';

/**
 * Env :: { smsApi: SmsApi }
 *  SmsApi.getAvailableNumbers :: () -> Future Error (Array String)
 *  SmsApi.sendMessage :: Object { from: String, to: String, message: String} -> Future Error String
 */

/*
  SmsMessage -> Future (Object { message_id: String })
*/
export function sendMessage(message) {

}

/*
  () -> Reader Env (Future Error AvailableNumbers)
*/
export function fetchAvailableNumbers() {
  return Reader(env =>
      env.smsApi.getAvailableNumbers().map((numbers) =>
        new messages.AvailableNumbers({ numbers: List(numbers) })
    )
  );
}

export const Messages = messages;
