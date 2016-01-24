import chai from 'chai';
import { LevelDbQueue } from '../../../src/services/persistent';
import db from 'level';

chai.expect();

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;
const assert = chai.assert;

var queue;

describe("Given a LevelDbQueue", function(){
  before(() => { queue = LevelDbQueue(); queue.init() });
  after(() => { if (queue) queue.purge().then(_ => queue.dispose());});
  describe("enqueueMessage", function(){
    it("should return a promise", () => {
      expect(queue.enqueueMessage({})).to.respondTo('then');
    });
    it("should broadcast the message", (done) => {
      var s = queue.subscribe((message) => {
        expect(message).to.eql({id:'1', my:'message'});
        s.dispose();
        done();
      });
      queue.enqueueMessage({id:'1', my:'message'});
    });
    it("should persist the message", (done) => {
      queue.enqueueMessage({id:'2', my:'message'})
        .then(() => {
          queue.isInQueue('2').then((res) => {
            expect(res).to.be.true;
            done();
          });
        }, (err) => done(err));
    });
    it("should delete the message when acked", (done) => {
      queue.enqueueMessage({id:'3', my:'message' })
        .then(() => queue.ackMessage({id:'3', my:'message'}))
          .then(() => {
            queue.isInQueue('3').then((res) => {
              expect(res).to.be.false;
              done();
            });
          }, (err) => done(err));
        })
  });
  
});