import chai from 'chai';
import { Future } from 'ramda-fantasy';
import { Typed } from 'typed-immutable';
import { MemoryCache } from '../../src/services/in-memory';
import { EnqueueMessage } from '../../src/pipelines';
import { SmsMessage } from '../../src/messages';
chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var lib;
var reader, future;

var msg;
describe("Given an SmsMessage", function(){
  before(() =>
    msg = new SmsMessage({
      id:'i', to:'2', message:'message'
    })
  );
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
          messageQueue: { enqueueMessage: (msg) => { queue = msg; return Promise.resolve(msg) } },
          messageStore: { put: (msg) => { storage = msg; return Promise.resolve(true) } }
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
              expect(queue).to.eql(res);
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
});
