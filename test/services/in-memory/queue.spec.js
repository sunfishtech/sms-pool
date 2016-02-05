import chai from 'chai';
import { MemoryQueue } from '../../../src/services/in-memory';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

describe("Given a MemoryQueue", function(){
  var queue;
  beforeEach(() => queue = MemoryQueue());
  describe("enqueueMessage", function(){
    it("should return an Observable", ()=>{
      expect(queue.enqueueMessage({})).to.respondTo('subscribe');
    });
    it("should broadcast the message", (done) => {
      queue.subscribe((message) => {
        expect(message).to.eql({my:'message'});
        done();
      });
      queue.enqueueMessage({my:'message'}).subscribe(_=>{});
    });
    it("should return the sent message", (done) => {
      queue.enqueueMessage({my:'message'}).subscribe(
        res => {
          expect(res).to.eql({my:'message'});
          done();
        }, err => done(err)
      );
    });
  });
  
});