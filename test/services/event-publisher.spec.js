import chai from 'chai';
import EventPublisher from '../../src/services/event-publisher.js';
import { Observable } from 'rx';

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
        publish: (e, t) => { evt = e; topic = t; return Observable.just(evt)},
      };
      const env = { eventBus: api };
      publisher = reader.run(env);
      evt = undefined; topic = undefined;
    });
    it("should return an instantiated api",() => {
      expect(publisher).to.respondTo('publish');
      expect(publisher).to.respondTo('broadcast');
    });
    describe("EventPublisher ~> broadcast", function() {
      it("should return an Observable", () => {
        expect(publisher.broadcast({})).to.respondTo('subscribe');
      });
      it("should broadcast an event", function(done){
        publisher.broadcast({an:'event'}).subscribe(
          function(result) {
            expect(evt).to.eql({an:'event'});
            expect(topic).to.be.undefined;
            done();
          }, err => done(err)
        );
      });
    });
    describe("EventPublisher ~> publish", function() {
      it("should return an Observable", () => {
        expect(publisher.publish('t',{})).to.respondTo('subscribe');
      })
      it("should publish an event to a topic", (done) => {
        publisher.publish('mytopic', {another:'event'}).subscribe(
          function(result) {
            expect(evt).to.eql({another:'event'});
            expect(topic).to.eql('mytopic');
            done();
          }, err => done(err)
        );
      });
    });

  });
});