'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createConfig = undefined;
exports.createServices = createServices;

var _utils = require('./utils');

var _joi = require('joi');

var _ramda = require('ramda');

var _ramdaFantasy = require('ramda-fantasy');

var _smsProviders = require('./sms-providers');

var providers = _interopRequireWildcard(_smsProviders);

var _services = require('./services');

var services = _interopRequireWildcard(_services);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var AVAILABLE_PROVIDERS = Object.keys(providers).map(_utils.underscore);
var AVAILABLE_SERVICES = Object.keys(services).map(_utils.underscore);
var availableServices = function availableServices(type) {
  return AVAILABLE_SERVICES.filter((0, _ramda.contains)('_' + type));
};

var SmsPoolConfig = (0, _utils.Schema)({
  provider: (0, _joi.object)().keys({
    name: (0, _joi.string)().required().allow(AVAILABLE_PROVIDERS),
    config: (0, _joi.object)()
  }).required(),

  messageStore: (0, _joi.object)().keys({
    name: (0, _joi.string)().required().allow(availableServices('store')),
    config: (0, _joi.object)()
  }).default({ name: 'memory_store' }),

  messageQueue: (0, _joi.object)().keys({
    name: (0, _joi.string)().required().allow(availableServices('queue')),
    config: (0, _joi.object)()
  }).default({ name: 'memory_queue' }),

  cache: (0, _joi.object)().keys({
    name: (0, _joi.string)().required().allow(availableServices('cache')),
    config: (0, _joi.object)()
  }).default({ name: 'memory_cache' }),

  rateLimiter: (0, _joi.object)().keys({
    name: (0, _joi.string)().required().allow(availableServices('limiter')),
    config: (0, _joi.object)()
  }).default({
    name: 'rate_limiter',
    config: { max: 1, period: 1000 }
  }),

  eventBus: (0, _joi.object)().keys({
    name: (0, _joi.string)().required().allow(availableServices('event_bus')),
    config: (0, _joi.object)()
  }).default({ name: 'memory_event_bus' }),

  idGenerator: (0, _joi.object)().keys({
    name: (0, _joi.string)().required().allow(availableServices('id_generator')),
    config: (0, _joi.object)()
  }).default({ name: 'id_generator', config: { version: 'v1' } })
});

/* :: Object -> Either Error SmsApi */
function createProvider(config) {
  var providerClass = (0, _utils.upperCamelCase)(config.name);

  return (0, _utils.Try)(function (_) {
    return providers[providerClass](config.config || {});
  });
}

/* :: Object -> Either Error Service */
function createService(config) {
  var serviceClass = (0, _utils.upperCamelCase)(config.name);

  return (0, _utils.Try)(function (_) {
    return services[serviceClass](config.config || {});
  });
}

var createConfig = exports.createConfig = (0, _utils.ensureValidObject)(SmsPoolConfig, {});

function createServices(config) {
  var instances = (0, _utils.getOrThrow)((0, _ramda.sequence)(_ramdaFantasy.Either.of, [createProvider(config.provider), createService(config.messageStore), createService(config.messageQueue), createService(config.cache), createService(config.rateLimiter), createService(config.eventBus), createService(config.idGenerator)]));
  var names = ['smsApi', 'messageStore', 'messageQueue', 'cache', 'rateLimiter', 'eventBus', 'idGenerator'];

  return (0, _ramda.zipObj)(names, instances);
}