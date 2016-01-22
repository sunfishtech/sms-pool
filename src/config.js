import { Schema, Try, ensureValidObject, underscore, upperCamelCase, getOrThrow } from './utils';
import { string, object } from 'joi';
import { contains, sequence, zipObj } from 'ramda';
import { Either } from 'ramda-fantasy';
import * as providers from './sms-providers';
import * as services from './services';

const AVAILABLE_PROVIDERS = Object.keys(providers).map(underscore);
const AVAILABLE_SERVICES = Object.keys(services).map(underscore);
const availableServices = (type) => AVAILABLE_SERVICES.filter(contains(`_${type}`));

const SmsPoolConfig = Schema({
  provider: object().keys({
    name: string().required().allow(AVAILABLE_PROVIDERS),
    config: object()
  }).required(),

  messageStore: object().keys({
    name: string().required().allow(availableServices('store')),
    config: object()
  }).default({ name: 'memory_store'}),

  messageQueue: object().keys({
    name: string().required().allow(availableServices('queue')),
    config: object()
  }).default({ name: 'memory_queue' }),

  cache: object().keys({
    name: string().required().allow(availableServices('cache')),
    config: object()
  }).default({ name: 'memory_cache' }),

  rateLimiter: object().keys({
    name: string().required().allow(availableServices('limiter')),
    config: object()
  }).default({
    name: 'rate_limiter',
    config: { max: 1, period: 1000 }
  }),

  eventBus: object().keys({
    name: string().required().allow(availableServices('event_bus')),
    config: object()
  }).default({ name: 'memory_event_bus' }),

  idGenerator: object().keys({
    name: string().required().allow(availableServices('id_generator')),
    config: object()
  }).default({ name: 'id_generator', config: { version: 'v1' }})
});

/* :: Object -> Either Error SmsApi */
function createProvider(config) {
  const providerClass = upperCamelCase(config.name);

  return Try(_ => providers[providerClass](config.config || {}));
}

/* :: Object -> Either Error Service */
function createService(config) {
  const serviceClass = upperCamelCase(config.name);

  return Try(_ => services[serviceClass](config.config || {}));
}

export const createConfig = ensureValidObject(SmsPoolConfig, {});

export function createServices(config) {
  const instances = getOrThrow(
    sequence(Either.of, [
      createProvider(config.provider),
      createService(config.messageStore),
      createService(config.messageQueue),
      createService(config.cache),
      createService(config.rateLimiter),
      createService(config.eventBus),
      createService(config.idGenerator)
    ]
  ));
  const names = ['smsApi', 'messageStore', 'messageQueue', 'cache', 'rateLimiter', 'eventBus', 'idGenerator'];

  return zipObj(names, instances);
}
