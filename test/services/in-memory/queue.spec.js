import chai from 'chai';
import { MemoryQueue } from '../../../src/services/in-memory';

chai.expect();

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;
const assert = chai.assert;

describe("Given a MemoryQueue", function(){
  var queue;
  beforeEach(() => queue = MemoryQueue());
  describe("enqueueMessage", function(){
    it("should return a promise", ()=>{
      expect(queue.enqueueMessage({})).to.respondTo('then');
    });
    it("should broadcast the message", (done) => {
      queue.subscribe((message) => {
        expect(message).to.eql({my:'message'});
        done();
      });
      queue.enqueueMessage({my:'message'});
    });
  });
  
});