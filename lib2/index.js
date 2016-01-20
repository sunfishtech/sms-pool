'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Providers = exports.Pipelines = exports.Messages = undefined;
exports.default = SmsPool;

var _messages = require('./messages');

var messages = _interopRequireWildcard(_messages);

var _pipelines = require('./pipelines');

var pipelines = _interopRequireWildcard(_pipelines);

var _smsProviders = require('./sms-providers');

var providers = _interopRequireWildcard(_smsProviders);

var _inMemory = require('./services/in-memory');

var _rateLimiter = require('./services/rate-limiter');

var _rateLimiter2 = _interopRequireDefault(_rateLimiter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Messages = exports.Messages = messages;
var Pipelines = exports.Pipelines = pipelines;
var Providers = exports.Providers = providers;

function SmsPool() {
  var config = {
    provider: {
      name: 'plivo',
      config: {
        authId: 'MANJC0NZJKNJE5YJYWZG',
        authToken: 'ZWUzMzMyMWE0ZmQzYjA2NTM0MzZiZDg2ZmQxMzJl'
      }
    }
  };

  var Env = {
    smsApi: Providers.Plivo(config.provider.config),
    messageStore: (0, _inMemory.MemoryStore)(),
    messageQueue: (0, _inMemory.MemoryQueue)(),
    cache: (0, _inMemory.MemoryCache)(),
    rateLimiter: (0, _rateLimiter2.default)(1, 1000)
  };

  var enqueuer = pipelines.EnqueueMessage.run(Env);
  var sender = pipelines.SendNextMessage.run(Env);

  Env.messageQueue.subscribe(function (message) {
    console.log("send", message);sender(message).fork();
  }, function (err) {
    return console.log(err);
  }, function (done) {
    return console.log('WHA?!');
  });

  return {
    sendMessage: function sendMessage(to, message) {
      return enqueuer(messages.SmsMessage({
        id: (+new Date()).toString(),
        to: to,
        message: message
      }));
    }
  };
}

var p = SmsPool().sendMessage("17074777548", "heehaw");
console.log(p);
p.fork(function (err) {
  return console.log(":(", err.stack);
}, function (res) {
  return console.log(res);
});