'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MemoryStore;

var _rx = require('rx');

function MemoryStore() {
  // store methods
  var _store = {};
  var putMessage = function putMessage(message) {
    return _store[message.id] = message;
  };
  var getMessage = function getMessage(id) {
    return _store[id];
  };

  return {
    /* :: SmsMessage -> SmsMessage */
    put: function put(message) {
      return _rx.Observable.just(message).do(putMessage).map(function (_) {
        return message;
      });
    },
    /* :: String -> SmsMessage */
    get: function get(id) {
      return _rx.Observable.just(id).map(getMessage);
    }
  };
}
module.exports = exports['default'];