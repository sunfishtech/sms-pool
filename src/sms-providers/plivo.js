import R from 'ramda';
import { Maybe } from 'ramda-fantasy';
import axios from 'axios';
import { Map } from 'immutable';
import { SmsApi } from './sms-api';
import { string, object } from 'joi';
import { Schema, ensureValidObject } from '../utils';
import { Observable } from 'rx';

const PlivoConfig = Schema({
  authId: string().required(),
  authToken: string().required(),
  apiVersion: string().default('1'),
  http: object()
});
const ensureConfig = ensureValidObject(PlivoConfig, {});

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
  const config = ensureConfig(_config);
  const baseUrl = `https://api.plivo.com/v${config.apiVersion}/Account/${config.authId}`;
  const endpoint = (path) => `${baseUrl}/${path}/`;
  const auth = {
    username: config.authId,
    password: config.authToken
  };
  const http = config.http || axios;

  return new SmsApi({
    /* :: () -> Observable List String */
    getAvailableNumbers: () => {
      const url = endpoint('Number');
      const extractNums = R.compose(R.pluck('number'), R.path(['data', 'objects']));

      return Observable.fromPromise(http.get(url, {auth}))
        .map(extractNums);
    },

    /* :: SmsMessage -> Observable String */
    sendMessage: (message) => {
      const url = endpoint('Message');
      const extractId = R.compose(R.head, R.path(['data', 'message_uuid']));

      return Observable.fromPromise(
        http.post(url, messageToPayload(message), {auth})
      ).retry(3).map(extractId);
    }
  });
}
