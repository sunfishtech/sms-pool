import { SendNextMessage, EnqueueMessage } from './pipelines';
import { curry } from 'ramda';
import { createConfig, createServices } from './config';
import { MessageAccepted } from './messages';

const createEnvironment = (services) => services; // should be a record

const initServices = (services) =>
  services.forEach((svc) => { if (svc.init) svc.init(); });

const startServices = (services) =>
  services.forEach((svc) => { if (svc.start) svc.start(); });

const disposeServices = (services) =>
  services.forEach((svc) => { if (svc.dispose) svc.dispose(); });

/* consider a per-command context that wraps the
   future pipeline and has an 'execute' and 'subscribe'
   method. This is returned from commands/method calls,
   and wraps an Rx observable that will prdoduce events
   and surface errors. subscribe will output results as they
   occur, and execute will gather the output events/error
   into an object and return that to the user.

   Look as kinesis for distribution & buffering
*/
export default function SmsPool(_config) {
  const config = createConfig(_config);
  const svcs = createServices(config);
  const events = svcs.eventBus;

  const executePipeline = curry((pipeline, command) => {
    const env = createEnvironment(svcs);

    return pipeline.run(env)(command);
  });

  // command handlers
  const sendMessage = executePipeline(SendNextMessage);
  const submitMessage = executePipeline(EnqueueMessage);

  initServices(svcs);
  svcs.messageQueue.subscribe(
    (message) => sendMessage(message).fork(
      (err) => events.publishError(err),
      (res) => events.publish(new MessageAccepted({messageId: res.id, vendorId: res.vendorId}))
    ),
    (err) => events.publishError(err),
    (done) => {}
  );
  startServices(svcs);

  return {
    services: svcs,
    events: events,
    sendMessage: (messageData) => submitMessage(messageData),
    dispose: () => disposeServices(svcs)
  };
}
