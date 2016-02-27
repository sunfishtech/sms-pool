import { SendNextMessage, EnqueueMessage, ReplayInFlightMessages } from './pipelines';
import { curry } from 'ramda';
import { createConfig, createServices } from './config';
import ServiceError from './messages/service-error';
import NumberPool from './services/number-pool';
import EVENT_TOPICS from './event-topics';

const createEnvironment = (services) => services; // should be a record

const initServices = (services) =>
  services.forEach((svc) => { if (svc.init) svc.init(); });

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

  const executeComponent = (component) => {
    const env = createEnvironment(svcs);

    return component.run(env);
  };

  const executePipeline = curry((pipeline, command) =>
    executeComponent(pipeline)(command));

  // command handlers
  const sendMessage = executePipeline(SendNextMessage);
  const submitMessage = executePipeline(EnqueueMessage);
  const getAvailableNumbers = executeComponent(NumberPool()).availableNumbers;
  const clearNumbers = executeComponent(NumberPool()).clearCache;
  const replayInFlight = executeComponent(ReplayInFlightMessages);

  const publishError = err => {
    const errMessage = err & err.message ? err.message : err ? err.toString() : 'Unknown Error';

    return events.publish(new ServiceError({error: errMessage}), EVENT_TOPICS.ERRORS)
      .subscribeOnError(err => { throw err; });
  };

  const listenForEnqueuedMessages = () => {
    events.subscribe(
      EVENT_TOPICS.ENQUEUED_MESSAGES,
      event => sendMessage(event.message).subscribeOnError(publishError),
      publishError
    );
  };

  const replayInFlightMessages = () => {
    svcs.messageQueue.inFlightMessages()
      .flatMap(replayInFlight)
      .subscribeOnError(publishError);
  };

  /* Startup Sequence */
  initServices(svcs);
  listenForEnqueuedMessages();
  replayInFlightMessages();

  /* API */
  return {
    services: svcs,
    events: events,
    sendMessage: submitMessage,
    availableNumbers: () => getAvailableNumbers().map(_ => _.numbers.toJS()),
    clearNumberPool: () => clearNumbers(),
    dispose: () => disposeServices(svcs)
  };
}
