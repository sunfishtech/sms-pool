import chai from 'chai';
import { MemoryEventBus } from '../../../src/services/in-memory';

chai.expect();

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;
const assert = chai.assert;

describe("Given an EventBus", function(){
  var bus;
  beforeEach(() => bus = MemoryEventBus());
  describe("publishing a message", function(){
    it("should return a promise", ()=>{
      expect(bus.publish({})).to.respondTo('then');
    });
    it("that settles on the original message", () => {
      expect(bus.publish({hi:'there'})).to.eventually.eql({hi:'there'});
    });
    it("should broadcast the message to the default topic when no topic is provided", (done) => {
      bus.subscribeAll((val) => {
        expect(val).to.eql({hi:'there'});
        done();
      }, (err) => done(err));
      bus.publish({hi:'there'});
    });
    it("should broadcast the message to a specific topic", (done) => {
      bus.subscribe('mytopic', (val) => {
        expect(val).to.eql({ho:'there'});
        done();
      }, (err) => done(err), 'mytopic');
      bus.publish({ho:'there'}, 'mytopic');
    });
    it("should broadcast the message on the specific and default topics", (done) => {
      bus.subscribeAll((val) => {
        expect(val).to.eql({he:'there'});
        done();
      }, (err) => done(err));
      bus.publish({he:'there'}, 'mytopic');
    });
    it("should broadcast errors", (done) => {
      const error = Error('oops');
      bus.subscribeAll((val) => done(val), (err) => {
        expect(err).to.eql(error);
        done();
      });
      bus.publishError(error);
    });
  });
});