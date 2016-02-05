import chai from 'chai';
import MessageQueue from '../../src/services/message-queue.js';
import { SmsMessage, SmsMessageStatus } from '../../src/messages';
import { Observable } from 'rx';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var reader, messageQueue, queue, qName;
const message = new SmsMessage({id:'id',to:'to',message:'msg', from:'me'});

describe("Given a MessageQueue",function(){
  before(() => {
      reader = MessageQueue();
  });
  
  it("should be a Reader", () => { assert(reader.run, "MessageQueue() does not return a reader")});

  describe("when run against an environment",function(){
    before(() => {
      const api = {
        enqueueMessage: (msg) => { queue = msg; return Observable.just(msg)},
        ackMessage: (msg) => { return Observable.just(msg) }
      };
      const env = { messageQueue: api };
      messageQueue = reader.run(env);
    });
    it("should return an instantiated api",() => {
      assert(messageQueue.enqueueMessage, "An enqueueMessage method is not defined on the MessageQueue API");
    });
    describe("MessageQueue ~> enqueueMessage", function() {
      it("should return an Observable", () => {
        assert(messageQueue.enqueueMessage(message).subscribe, "MessageQueue ~> enqueueMessage did not return an Observable");
      });
      it("update the status to ENQUEUED", function(done){
        messageQueue.enqueueMessage(message).subscribe(
          function(result) {
            expect(result.status).to.equal(SmsMessageStatus.ENQUEUED);
            done();
          },function(err){done(err)}
        );
      });
      it("should enqueue a message", function(done){
        messageQueue.enqueueMessage(message).subscribe(
          function(result) {
            expect(queue).to.eql(message);
            done();
          },function(err){done(err)}
        );
      });
    });
    describe("MessageQueue ~> ackMessage", function() {
      it("should return an Observable", () => {
        assert(messageQueue.ackMessage(message).subscribe, "MessageQueue ~> ackMessage did not return an Observable");
      });
      it("should return the same message", function(done){
        messageQueue.ackMessage(message).subscribe(
          function(result) {
            expect(result).to.equal(message);
            done();
          },function(err){done(err)}
        );
      });
    });
  });
});