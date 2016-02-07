import chai from 'chai';
import { Typed } from 'typed-immutable';
import { MemoryCache } from '../../src/services/in-memory';
import { EnqueueMessage } from '../../src/pipelines';
import { SmsMessage, SmsMessageStatus } from '../../src/messages';
import { Observable } from 'rx';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var lib;
var reader, obs;

var msg;
describe("Given an SmsMessage", function(){
  before(() => {
    msg = { to:'2', message:'message' };
  });
  describe("EnqueueMessage", function(){
    let queue, storage, pipeline, topic, published;
    before(() => reader = EnqueueMessage);
    it("should return a Reader",() => {
      assert(reader.run);
    });
    describe("when run against an environment", function(){
      before(() => {
        const env = {
          smsApi: { getAvailableNumbers: () => Observable.just(['a','b','c']) },
          cache: new MemoryCache(),
          messageQueue: { enqueueMessage: (m) => { queue = m; return Observable.just(m) } },
          messageStore: { put: (m) => { storage = m; return Observable.just(m) } },
          idGenerator: { next: () => '12345' },
          eventBus: {
            publish: (evt, t) => { topic = t; published = evt; return Observable.just(evt) }
          }
        };
        pipeline = reader.run(env);
        obs = pipeline(msg);
      });
      it("should return an Observable", ()=>{
        expect(obs).to.respondTo('subscribe');
      });
      describe("that when subscribed", function(){
        it("returns a MessageEnqueued event", (done) => {
          obs.subscribe(
            (res) => {
              expect(res[Typed.typeName]()).to.equal('MessageEnqueued');
              done();
            }
          )
        });  
        it("generates a message id", (done) => {
          obs.subscribe(
            (res) => {
              expect(res.message.id).to.equal('12345');
              done();
            }
          );
        });
        it("appends a sending phone number", (done) => {
          obs.subscribe(
            (res) => {
              expect(['a','b','c']).to.include(storage.from);
              done();
            }
          )
        });
        it("enqueues a Message", (done) => {
          obs.subscribe(
            (res) => {
              expect(queue[Typed.typeName]()).to.equal('SmsMessage');
              done();
            }
          )
        });
        it("updates the status to ENQUEUED", (done) => {
          obs.subscribe(
            (res) => {
              expect(storage.status).to.equal(SmsMessageStatus.ENQUEUED);
              done();
            }
          )
        });
        it("stores the final message", (done) => {
          obs.subscribe(
            (res) => {
              expect(storage.id).to.equal(res.message.id);
              done();
            }
          )
        });
        it("publishes the event", (done) => {
          obs.subscribe(
            (res) => {
              expect(published).to.eql(res);
              done();
            }, err => done(err)
          )
        });
      });
    });
  });
});
