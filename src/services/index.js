const memoryServices = require('./in-memory');

export default Object.assign(memoryServices, {
  RateLimiter: require('./rate-limiter'),
  IdGenerator: require('./id-generator')
});
