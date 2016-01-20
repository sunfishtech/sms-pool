import * as messages from './messages';
import * as pipelines from './pipelines';
import * as providers from './sms-providers';

export const Messages = messages;
export const Pipelines = pipelines;
export const Providers = providers;

import { MemoryStore, MemoryQueue, MemoryCache } from './services/in-memory';
import RateLimiter from './services/rate-limiter';

export default function SmsPool() {
  const config = {
    provider: {
      name: 'plivo',
      config: {
        authId: process.env.PLIVO_AUTH_ID,
        authToken: process.env.PLIVO_AUTH_TOKEN
      }
    }
  };

  const Env = {
    smsApi: Providers.Plivo(config.provider.config),
    messageStore: MemoryStore(),
    messageQueue: MemoryQueue(),
    cache: MemoryCache(),
    rateLimiter: RateLimiter(1, 1000)
  };

  const enqueuer = pipelines.EnqueueMessage.run(Env);
  const sender = pipelines.SendNextMessage.run(Env);

  Env.messageQueue.subscribe(
    (message) => { console.log("send",message); sender(message).fork() },
    (err) => console.log(err),
    (done) => console.log('WHA?!')
  );

  return {
    sendMessage: (to, message) =>
      enqueuer(messages.SmsMessage({
        id: (+new Date()).toString(),
        to: to,
        message: message
      }))
  };
}

// const p = SmsPool().sendMessage("17074777548","heehaw");
// console.log(p);
// p.fork((err)=>console.log(":(",err.stack), (res)=>console.log(res));

