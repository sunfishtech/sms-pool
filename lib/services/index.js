'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var memoryServices = require('./in-memory');
var persistentServices = require('./persistent');

exports.default = Object.assign(memoryServices, persistentServices, {
  RateLimiter: require('./rate-limiter'),
  IdGenerator: require('./id-generator')
});
module.exports = exports['default'];