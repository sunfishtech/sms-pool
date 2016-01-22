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

var _immutable = require('immutable');

var _smsApi = require('./sms-api');

var _joi = require('joi');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PlivoConfig = (0, _utils.Schema)({
  authId: (0, _joi.string)().required(),
  authToken: (0, _joi.string)().required(),
  apiVersion: (0, _joi.string)().default('1'),
  http: (0, _joi.object)()
});
var ensureConfig = (0, _utils.ensureValidObject)(PlivoConfig, {});

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

  var config = ensureConfig(_config);
  var baseUrl = 'https://api.plivo.com/v' + config.apiVersion + '/Account/' + config.authId;
  var endpoint = function endpoint(path) {
    return baseUrl + '/' + path + '/';
  };
  var auth = {
    username: config.authId,
    password: config.authToken
  };
  var http = config.http || _axios2.default;

  return new _smsApi.SmsApi({
    /* :: () -> Future Error (List String) */
    getAvailableNumbers: function getAvailableNumbers() {
      var url = endpoint('Number');
      var extractNums = _ramda2.default.compose(_ramda2.default.pluck('number'), _ramda2.default.path(['data', 'objects']));

      return http.get(url, { auth: auth }).then(extractNums);
    },

    /* :: SmsMessage -> Promise String Error */
    sendMessage: function sendMessage(message) {
      var url = endpoint('Message');
      var extractId = _ramda2.default.compose(_ramda2.default.head, _ramda2.default.path(['data', 'message_uuid']));

      return http.post(url, messageToPayload(message), { auth: auth }).then(extractId);
    }
  });
}
module.exports = exports['default'];