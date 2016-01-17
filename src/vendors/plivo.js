import R from 'ramda';
import { Maybe } from 'ramda-fantasy';
import axios from 'axios';
import { Record as Schema } from 'typed-immutable';
import { Map } from 'immutable';
import { SmsApi } from './sms-api';

const PlivoConfig = Schema({
  authId: String,
  authToken: String,
  apiVersion: String,
  http: Object
});

const defaultConfig = {
  apiVersion: '1',
  http: axios
};

function messageToPayload(message) {
  return Maybe(message.callbackUrl).reduce(
    (payload, val) => payload.set('url', val),
    Map({ src: message.from, dst: message.to, text: message.message })
  ).toJS();
}

/*
 Plivo :: PlivoConfig -> SmsApi
    getAvailableNumbers :: () -> Promise (List String) Error
    sendMessage :: SmsMessage -> Promise String Error
*/
export default function Plivo(_config = {}) {
  const config = new PlivoConfig(
    Object.assign({}, defaultConfig, _config)
  );
  const baseUrl = `https://api.plivo.com/v${config.apiVersion}/Account/${config.authId}`;
  const endpoint = (path) => `${baseUrl}/${path}/`;
  const auth = {
    username: config.authId,
    password: config.authToken
  };

  return new SmsApi({
    /* :: () -> Future Error (List String) */
    getAvailableNumbers: () => {
      const url = endpoint('Number');
      const extractNums = R.compose(R.pluck('number'), R.path(['data', 'objects']));

      return config.http.get(url, {auth}).then(extractNums);
    },

    /* :: SmsMessage -> Promise String Error */
    sendMessage: (message) => {
      const url = endpoint('Message');
      const extractId = R.compose(R.head, R.path(['data', 'message_uuid']));

      return config.http.post(url, messageToPayload(message), {auth})
        .then(extractId);
    }
  });
}

