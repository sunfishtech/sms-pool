import chai from 'chai';
import { Future } from 'ramda-fantasy';
import { Typed } from 'typed-immutable';
import { MemoryCache } from '../../src/services/in-memory';
import { EnqueueMessage } from '../../src/pipelines';
import { SmsMessage, SmsMessageStatus } from '../../src/messages';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var lib;
var reader, future;

var msg;
describe("Given an SmsMessage", function(){
  before(() => {
    msg = { to:'2', message:'message' };
  });
  describe("EnqueueMessage", function(){
    let queue, storage, pipeline;
    before(() => reader = EnqueueMessage);
    it("should return a Reader",() => {
      assert(reader.run);
    });
    describe("when run against an environment", function(){
      before(() => {
        const env = {
          smsApi: { getAvailableNumbers: () => Promise.resolve(['a','b','c']) },
          cache: new MemoryCache(),
          messageQueue: { enqueueMessage: (m) => { queue = m; return Promise.resolve(m) } },
          messageStore: { put: (m) => { storage = m; return Promise.resolve(true) } },
          idGenerator: { next: () => '12345' }
        };
        pipeline = reader.run(env);
        future = pipeline(msg);
      });
      it("should return a future", ()=>{
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
        it("generates a message id", (done) => {
          future.fork((err) => done(err),
            (res) => {
              expect(res.id).to.equal('12345');
              done();
            }
          );
        });
        it("appends a sending phone number", (done) => {
          future.fork((err) => done(err),
            (res) => {
              expect(['a','b','c']).to.include(res.from);
              done();
            }
          )
        });
        it("enqueues a Message", (done) => {
          future.fork((err) => done(err),
            (res) => {
              expect(queue[Typed.typeName]()).to.equal('SmsMessage');
              done();
            }
          )
        });
        it("updates the status to ENQUEUED", (done) => {
          future.fork((err) => done(err),
            (res) => {
              expect(res.status).to.equal(SmsMessageStatus.ENQUEUED);
              done();
            }
          )
        });
        it("stores the final message", (done) => {
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
});
