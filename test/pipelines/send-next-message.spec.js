import chai from 'chai';
import { Future } from 'ramda-fantasy';
import { Typed } from 'typed-immutable';
import { MemoryCache } from '../../src/services/in-memory';
import { SendNextMessage } from '../../src/pipelines';
import { SmsMessage, SmsMessageStatus } from '../../src/messages';
import RateLimiter from '../../src/services/rate-limiter';
import { Observable } from 'rx';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

const message = SmsMessage({
  id:'id',
  from:'from',
  to:'to',
  message:'message'
});

describe("SendNextMessage", function(){
  let reader;
  before(() => reader = SendNextMessage);
  it("should return a Reader",() => {
    assert(reader.run);
  });
  describe("when run against an environment", function(){
    let sent, acked, pipeline, obs, storage;
    beforeEach(() => {
      const env = {
        messageQueue: {
          ackMessage: (msg) => { acked = msg; return Observable.just(msg) }
        },
        messageStore: {
          put: (msg) => { storage = msg; return Observable.just(true)},
          get: (id) => { return Observable.just({'123':message}[id]) }
        },
        smsApi: { sendMessage: (msg) => { sent = msg; return Observable.just('123456') } },
        rateLimiter: RateLimiter(1000,1) /* 1000 messages per MS */
      };
      pipeline = reader.run(env);
      obs = pipeline(message);
    });
    it("should return an Observable", ()=>{
      expect(obs).to.respondTo('subscribe');
    });
    describe("that when subscribed", function(){
      it("returns a MessageAccepted event", (done) => {
        let s = obs.subscribe(
          (res) => {
            expect(res[Typed.typeName]()).to.equal('MessageAccepted');
            s.dispose();
            done();
          }
        )
      });  
      it("sends a message", (done) => {
        obs.subscribe(
          (res) => {
            expect(sent).to.equal(message);
            done();
          }
        )
      });
      it("acks the queue", (done) => {
        obs.subscribe(
          (res) => {
            expect(acked).to.equal(res.message);
            done();
          }
        )
      });
      it("stores the message", (done) => {
        obs.subscribe(
          (res) => {
            expect(storage).to.equal(res.message);
            done();
          }
        )
      });
    });
  });
});
