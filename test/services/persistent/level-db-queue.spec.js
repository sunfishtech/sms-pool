import chai from 'chai';
import { LevelDbQueue } from '../../../src/services/persistent';
import db from 'level';
import { Observer } from 'rx';

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
      queue.enqueueMessage({id:'3',my:'message'}).subscribe(
        res => {
          expect(res).to.eql({id:'3',my:'message'});
          done();
        }, err => done(err)
      );
    });
    it("should broadcast the message", (done) => {
      var s = queue.subscribe((message) => {
        expect(message).to.eql({id:'1', my:'message'});
        s.dispose();
        done();
      }, (err) => done(err));
      queue.enqueueMessage({id:'1', my:'message'}).subscribe(_=>{}, err => done(err));
    });
    it("should persist the message", (done) => {
      queue.enqueueMessage({id:'2', my:'message'})
        .flatMap(_ => queue.isInQueue('2')
          .do((res) => {
            expect(res).to.be.true;
            done();
          })
        ).subscribe(_=>{});
    });
    it("should delete the message when acked", (done) => {
      queue.enqueueMessage({id:'3', my:'message' })
        .flatMap(_ => queue.ackMessage({id:'3', my:'message'}))
        .flatMap(_ => {
          return queue.isInQueue('3').do((res) => {
            expect(res).to.be.false;
            done();
          });
        }).subscribe(_=>{})
    });
  });
  
});