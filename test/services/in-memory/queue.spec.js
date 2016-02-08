import chai from 'chai';
import { MemoryQueue } from '../../../src/services/in-memory';
import { Observable } from 'rx';

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
    it("should return the sent message", (done) => {
      queue.enqueueMessage({my:'message'}).subscribe(
        res => {
          expect(res).to.eql({my:'message'});
          done();
        }, err => done(err)
      );
    });
  });
  describe("inFlightMessages", function(){
    it("should return a list of enqueued messages", (done) => {
      Observable.just(true)
        .flatMap(_ => queue.enqueueMessage({my:'message'}))
        .flatMap(_ => queue.enqueueMessage({your:'message'}))
        .flatMap(_ => queue.inFlightMessages())
        .toArray()
        .subscribe(
          res => {
            expect(res.length).to.eql(2);
            expect(res[0].my).to.eql('message');
            expect(res[1].your).to.eql('message');
            done();
          }, err => done(err)
        );
    });
  });
  describe("ackMessage", function(){
    it("should return the original message", (done) => {
      queue.ackMessage({hi:'there'}).subscribe(
        res => {
          expect(res).to.eql({hi:'there'});
          done();
        }, err => done(err)
      );
    });
    it("should remove the message from in flight messages", (done) => {
      Observable.just(true)
        .flatMap(_ => queue.purge())
        .flatMap(_ => queue.enqueueMessage({id:'1'}))
        .flatMap(_ => queue.enqueueMessage({id:'2'}))
        .flatMap(_ => queue.ackMessage({id:'1'}))
        .flatMap(_ => queue.inFlightMessages())
        .map(m => m.id)
        .toArray()
        .subscribe(
          res => {
            expect(res).to.eql(['2']);
            done();
          }, err => done(err)
        )
    });
  });    
});