'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MemoryStore;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function MemoryStore() {
  // store methods
  var _store = {};
  var putMessage = function putMessage(message) {
    return _store[message.id] = message;
  };
  var getMessage = function getMessage(id) {
    return _store[id];
  };

  // util
  var toPromise = function toPromise(val) {
    return Promise.resolve(val);
  };
  var promise = function promise(fn) {
    return _ramda2.default.compose(toPromise, fn);
  };

  return {
    /* :: {messageId: String, ...} -> Boolean */
    put: promise(putMessage),
    /* :: String -> Object */
    get: promise(getMessage)
  };
}
module.exports = exports['default'];