import { SendNextMessage, EnqueueMessage } from './pipelines';
import { curry } from 'ramda';
import { createConfig, createServices } from './config';

/* consider a per-command context that wraps the
   future pipeline and has an 'execute' and 'subscribe'
   method. This is returned from commands/method calls,
   and wraps an Rx observable that will prdoduce events
   and surface errors. subscribe will output results as they
   occur, and execute will gather the output events/error
   into an object and return that to the user.
*/
export default function SmsPool(_config) {
  const config = createConfig(_config);
  const svcs = createServices(config);

  const events = svcs.eventBus;

  const createEnvironment = () => svcs; // should be a record

  const executePipeline = curry((pipeline, command) => {
    const env = createEnvironment();

    return pipeline.run(env)(command);
  });

  // command handlers
  const sendMessage = executePipeline(SendNextMessage);
  const submitMessage = executePipeline(EnqueueMessage);

  svcs.messageQueue.subscribe(
    (message) => sendMessage(message).fork(),
    (err) => console.log(err),
    (done) => {}
  );

  return {
    services: svcs,
    events: events,
    sendMessage: (messageData) => submitMessage(messageData)
  };
}
