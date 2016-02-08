import chai from 'chai';
import { Typed } from 'typed-immutable';
import { MemoryCache } from '../../src/services/in-memory';
import { ReplayInFlightMessages } from '../../src/pipelines';
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
    msg = { id:'1', to:'2', message:'message' };
  });
  describe("ReplayInFlightMessages", function(){
    let pipeline, topic, published;
    before(() => reader = ReplayInFlightMessages);
    it("should return a Reader",() => {
      assert(reader.run);
    });
    describe("when run against an environment", function(){
      before(() => {
        const env = {
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
