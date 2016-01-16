import { Future } from 'ramda-fantasy';
import R from 'ramda';
import axios from 'axios';
import { Record } from 'typed-immutable';
import { SmsApi } from './sms-api';

const PlivoConfig = Record({
  authId: String,
  authToken: String,
  apiVersion: String,
  http: Object
});

const defaultConfig = {
  apiVersion: '1',
  http: axios
};

/*
 Implements SmsApi

 Plivo :: String -> String -> String -> HTTP -> {
    getAvailableNumbers :: () -> Future Error (List String)
 }
 HTTP :: {
  get: String -> Promise Object String
 }
*/
export default function Plivo(_config = {}) {
  const config = new PlivoConfig(
    Object.assign({}, defaultConfig, _config)
  );
  const baseUrl = `https://api.plivo.com/v${config.apiVersion}/Account/${config.authId}`;
  const endpoint = (path) => `${baseUrl}/${path}`;
  const auth = {
    username: config.authId,
    password: config.authToken
  };

  return new SmsApi({
    /* getAvailableNumbers :: () -> Future Error (List String) */
    getAvailableNumbers: () => {
      const url = endpoint('Number');

      return Future(function (reject, resolve) {
        const success = (response) => {
          try {
            resolve(R.pluck('number', response.data.objects));
          } catch (err) { reject(err); }
        };
        const fail = (err) => reject(err);

        config.http.get(url, {auth}).then(success, fail);
      });
    }
  });
}

