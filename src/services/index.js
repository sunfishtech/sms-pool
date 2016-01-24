const memoryServices = require('./in-memory');
const persistentServices = require('./persistent');

export default Object.assign(memoryServices, persistentServices, {
  RateLimiter: require('./rate-limiter'),
  IdGenerator: require('./id-generator')
});
