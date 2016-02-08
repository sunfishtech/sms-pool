import { Observable } from 'rx';
import { contains } from 'ramda';

export default function MemoryQueue() {
  var _inFlight = [];
  var _acked = [];

  return {
    /* :: SmsMessage -> Observable Message */
    enqueueMessage: (message) => {
      _inFlight.push(message);
      return Observable.just(message);
    },
    /* :: SmsMessage -> Observable SmsMessage */
    ackMessage: (message) => {
      _acked.push(message.id);
      return Observable.just(message);
    },

    inFlightMessages: () =>
      Observable.from(_inFlight).filter(m => !contains(m.id, _acked)),

    purge: () => { _inFlight = []; _acked = []; return Observable.just(true); }
  };
}
