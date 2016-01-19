import chai from 'chai';
import { Future } from 'ramda-fantasy';
import { Typed } from 'typed-immutable';
import { MemoryCache } from '../../src/utils';
import { SendNextMessage } from '../../src/pipelines';
import { SmsMessage, MessageTag } from '../../src/messages';
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
    let sent, acked, pipeline, future, storage;
    before(() => {
      const env = {
        messageQueue: {
          dequeueMessage: () => { return Promise.resolve({messageId:'123'}) },
          ackMessage: (msg) => { acked = msg; return Promise.resolve(true) }
        },
        messageStore: {
          put: (msg) => { storage = msg; return Promise.resolve(true)},
          get: (id) => { return Promise.resolve({'123':message}[id]) }
        },
        smsApi: { sendMessage: (msg) => { sent = msg; return Promise.resolve(true) } }
      };
      pipeline = reader.run(env);
      //future = pipeline();
    });
    it("should return a future", ()=>{
      future = pipeline();
      assert(future.fork, `${future} does not appear to be a Future`);
    });
    describe("that when forked", function(){
      it("returns an SmsMessage", (done) => {
        future.fork((err) => done(err),
          (res) => {
            expect(res[Typed.typeName]()).to.equal('SmsMessage');
            done();
          }
        )
      });  
      it("dequeues, retrieves and sends a message", (done) => {
        future.fork((err) => done(err),
          (res) => {
            expect(sent).to.equal(res);
            done();
          }
        )
      });
      it("acks the queue", (done) => {
        future.fork((err) => done(err),
          (res) => {
            expect(acked).to.equal(res);
            done();
          }
        )
      });
      it("stores the message", (done) => {
        future.fork((err) => done(err),
          (res) => {
            expect(storage).to.equal(res);
            done();
          }
        )
      });
    });
  });
});
