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

var _rx = require('rx');

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

  /* String -> Object -> Observable Object */
  var putMessage = function putMessage(id, message) {
    return _rx.Observable.fromNodeCallback(_db.put.bind(_db))(id, message).map(function (_) {
      return message;
    });
  };
  /* :: String -> Observable Object */
  var getMessage = function getMessage(id) {
    return _rx.Observable.fromNodeCallback(_db.get.bind(_db))(id);
  };

  return {
    init: function init() {
      return _db = (0, _level2.default)(dbFile, { valueEncoding: 'json' });
    },
    dispose: function dispose() {
      if (_db) _db.close();
    },
    /* :: {id:String, ...} -> Observable Object */
    put: function put(message) {
      return putMessage(message.id, message);
    },
    /* :: String -> Observable Object */
    get: function get(id) {
      return getMessage(id);
    }
  };
}
module.exports = exports['default'];