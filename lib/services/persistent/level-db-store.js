'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = LevelDbStore;

var _joi = require('joi');

var _utils = require('../../utils');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _level = require('level');

var _level2 = _interopRequireDefault(_level);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LevelDbConfig = (0, _utils.Schema)({
  dataDir: (0, _joi.string)().default('./data'),
  dbName: (0, _joi.string)().default('message_store')
});
var ensureConfig = (0, _utils.ensureValidObject)(LevelDbConfig, {});

function LevelDbStore() {
  var _config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var config = ensureConfig(_config);
  var dbFile = _path2.default.join(config.dataDir, config.dbName);
  var _db = undefined;

  // store methods
  var putMessage = function putMessage(message) {
    return (0, _utils.callbackToPromise)(_db.put.bind(_db), message.id, message);
  };

  var getMessage = function getMessage(id) {
    return (0, _utils.callbackToPromise)(_db.get.bind(_db), id);
  };

  return {
    init: function init() {
      return _db = (0, _level2.default)(dbFile, { valueEncoding: 'json' });
    },
    dispose: function dispose() {
      if (_db) _db.close();
    },
    /* :: {messageId: String, ...} -> Boolean */
    put: putMessage,
    /* :: String -> Object */
    get: getMessage
  };
}
module.exports = exports['default'];