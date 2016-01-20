'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Plivo;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _ramdaFantasy = require('ramda-fantasy');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _typedImmutable = require('typed-immutable');

var _immutable = require('immutable');

var _smsApi = require('./sms-api');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PlivoConfig = (0, _typedImmutable.Record)({
  authId: String,
  authToken: String,
  apiVersion: String,
  http: Object
});

var defaultConfig = {
  apiVersion: '1',
  http: _axios2.default
};

function messageToPayload(message) {
  return (0, _ramdaFantasy.Maybe)(message.callbackUrl).reduce(function (payload, val) {
    return payload.set('url', val);
  }, (0, _immutable.Map)({ src: message.from, dst: message.to, text: message.message })).toJS();
}

/*
 Plivo :: PlivoConfig -> SmsApi
    getAvailableNumbers :: () -> Promise (List String) Error
    sendMessage :: SmsMessage -> Promise String Error
*/
function Plivo() {
  var _config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var config = new PlivoConfig(Object.assign({}, defaultConfig, _config));
  var baseUrl = 'https://api.plivo.com/v' + config.apiVersion + '/Account/' + config.authId;
  var endpoint = function endpoint(path) {
    return baseUrl + '/' + path + '/';
  };
  var auth = {
    username: config.authId,
    password: config.authToken
  };

  return new _smsApi.SmsApi({
    /* :: () -> Future Error (List String) */
    getAvailableNumbers: function getAvailableNumbers() {
      var url = endpoint('Number');
      var extractNums = _ramda2.default.compose(_ramda2.default.pluck('number'), _ramda2.default.path(['data', 'objects']));

      return config.http.get(url, { auth: auth }).then(extractNums);
    },

    /* :: SmsMessage -> Promise String Error */
    sendMessage: function sendMessage(message) {
      var url = endpoint('Message');
      var extractId = _ramda2.default.compose(_ramda2.default.head, _ramda2.default.path(['data', 'message_uuid']));

      return config.http.post(url, messageToPayload(message), { auth: auth }).then(extractId);
    }
  });
}
module.exports = exports['default'];