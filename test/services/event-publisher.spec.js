import chai from 'chai';
import EventPublisher from '../../src/services/event-publisher.js';
import { Future } from 'ramda-fantasy';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var reader, publisher, evt, topic;

describe("Given an EventPublisher",function(){
  before(() => {
    reader = EventPublisher();
  });
  
  it("should be a Reader", () => { assert(reader.run, "MessagePublisher() does not return a reader")});

  describe("when run against an environment",function(){
    beforeEach(() => {
      const api = {
        publish: (e, t) => { evt = e; topic = t; return Promise.resolve(evt)},
      };
      const env = { eventBus: api };
      publisher = reader.run(env);
      evt = undefined; topic = undefined;
    });
    it("should return an instantiated api",() => {
      assert(publisher.publish, "A publish method is not defined on the EventBus API");
      assert(publisher.broadcast, "A broadcast method is not defined on the EventBus API");
    });
    describe("EventPublisher ~> broadcast", function() {
      it("should return a Future", () => {
        expect(publisher.broadcast({})).to.respondTo('fork');
      });
      it("should broadcast an event", function(done){
        publisher.broadcast({an:'event'}).fork(function(err){done(err)},//err callback
          function(result) {
            expect(evt).to.eql({an:'event'});
            expect(topic).to.be.undefined;
            done();
          }
        );
      });
    });
    describe("EventPublisher ~> publish", function() {
      it("should return a future", () => {
        expect(publisher.publish('t',{})).to.respondTo('fork');
      })
      it("should publish an event to a topic", (done) => {
        publisher.publish('mytopic', {another:'event'}).fork(function(err){done(err)},
          function(result) {
            expect(evt).to.eql({another:'event'});
            expect(topic).to.eql('mytopic');
            done();
          }
        );
      });
    });

  });
});