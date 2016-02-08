import chai from 'chai';
import { LevelDbQueue } from '../../../src/services/persistent';
import db from 'level';
import { Observable } from 'rx';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var queue;

describe("Given a LevelDbQueue", function(){
  before(() => { queue = LevelDbQueue(); queue.init() });
  after(() => { if (queue) queue.purge().do(_ => queue.dispose()).subscribe(_=>{});});
  describe("enqueueMessage", function(){
    it("should return an Observable", () => {
      expect(queue.enqueueMessage({})).to.respondTo('subscribe');
    });
    it("should return the sent message", function(done){
      Observable.just(queue)
        .flatMap(_ => queue.purge())
        .flatMap(_ => queue.enqueueMessage({id:'3',my:'message'})).subscribe(
          res => {
            expect(res).to.eql({id:'3',my:'message'});
            done();
          }, err => done(err)
        );
    });
    it("should persist the message", (done) => {
      Observable.just(queue)
        .flatMap(_ => queue.purge())
        .flatMap(_ => queue.enqueueMessage({id:'2', my:'message'}))
        .flatMap(_ => queue.isInQueue('2'))
        .subscribe(
          res => {
            expect(res).to.be.true;
            done();
          }, err => done(err)
        );
    });
    it("should delete the message when acked", (done) => {
      Observable.just(queue)
        .flatMap(_ => queue.purge())
        .flatMap(_ => queue.enqueueMessage({id:'3', my:'message' }))
        .flatMap(_ => queue.ackMessage({id:'3', my:'message'}))
        .flatMap(_ => queue.isInQueue('3'))
        .subscribe(
          res => {
            expect(res).to.be.false;
            done();
          }, err => done(err)
        );
    });
  });
  describe("inFlightMessages", function(){
    it("should return an observable of unacked messages", (done) => {
      Observable.just(queue)
        .flatMap(_ => queue.purge())
        .flatMap(_ => queue.enqueueMessage({id:'a',to:'dave', message:'message'}))        
        .flatMap(_ => queue.enqueueMessage({id:'b',to:'sam', message:'message'}))
        .flatMap(_ => queue.enqueueMessage({id:'c',to:'joe', message:'message'}))
        .flatMap(_ => queue.ackMessage({id:'b'}))
        .flatMap(_ => queue.inFlightMessages())
        .map(m => m.id).toArray()
        .subscribe(
          res => {
            expect(res).to.eql(['a','c']);
            done();
          }, err => done(err)
        );
     
    });
  });
  
});