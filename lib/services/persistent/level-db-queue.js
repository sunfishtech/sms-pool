'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = LevelDbQueue;

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
  dbName: (0, _joi.string)().default('message_queue')
});
var ensureConfig = (0, _utils.ensureValidObject)(LevelDbConfig, {});

function LevelDbQueue() {
  var _config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var config = ensureConfig(_config);
  var dbFile = _path2.default.join(config.dataDir, config.dbName);
  var subject = new _rx.Subject();
  var _db = undefined;

  var broadcastMessage = function broadcastMessage(message) {
    subject.onNext(message);return message;
  };

  var enqueue = function enqueue(message) {
    var data = message.toJS ? message.toJS() : message;

    return (0, _utils.callbackToPromise)(_db.put.bind(_db), data.id, data).then(function (_) {
      return broadcastMessage(message);
    });
  };

  var isInQueue = function isInQueue(id) {
    return (0, _utils.callbackToPromise)(_db.get.bind(_db), id).then(function (ok) {
      return true;
    }, function (err) {
      return err.notFound ? false : Promise.reject(err);
    });
  };

  var ack = function ack(message) {
    return (0, _utils.callbackToPromise)(_db.del.bind(_db), message.id);
  };

  var purgeQueue = function purgeQueue() {
    return new Promise(function (resolve, reject) {
      _db.createKeyStream().on('data', function (key) {
        return _db.del(key);
      }).on('end', function () {
        return resolve(true);
      }).on('error', function (err) {
        return reject(err);
      });
    });
  };

  var requeueAll = function requeueAll() {
    return _db.createValueStream().on('data', broadcastMessage);
  };

  return {
    init: function init() {
      return _db = (0, _level2.default)(dbFile, { valueEncoding: 'json' });
    },
    start: function start() {
      return requeueAll();
    },
    dispose: function dispose() {
      if (_db) _db.close();
    },
    /* :: { messageId: String, queue: String } -> Promise { messageId: String, queue: String } */
    enqueueMessage: enqueue,
    /* :: { messageId: String, queue: String } -> Promise Boolean */
    ackMessage: ack,
    /* :: (SmsMessage -> _) -> (Err -> _) -> (_ -> _) -> Rx.Subscription */
    subscribe: function subscribe(onMessage, onErr, onComplete) {
      return subject.subscribe(onMessage, onErr, onComplete);
    },
    /* :: String -> Promise Boolean Error */
    isInQueue: isInQueue,
    /* :: () -> Promise Boolean Error */
    purge: purgeQueue
  };
}
module.exports = exports['default'];