'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var memoryServices = require('./in-memory');

exports.default = Object.assign(memoryServices, {
  RateLimiter: require('./rate-limiter'),
  IdGenerator: require('./id-generator')
});
module.exports = exports['default'];