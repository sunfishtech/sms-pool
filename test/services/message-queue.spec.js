import chai from 'chai';
import MessageQueue from '../../src/services/message-queue.js';
import { Future } from 'ramda-fantasy';
import { SmsMessage } from '../../src/messages';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var reader, messageQueue, storage;
const message = new SmsMessage({id:'id',to:'to',message:'msg'});

describe("Given a MessageQueue",function(){
  before(() => {
      reader = MessageQueue();
  });
  
  it("should be a Reader", () => { assert(reader.run, "MessageQueue() does not return a reader")});

  describe("when run against an environment",function(){
    before(() => {
      const api = {
        enqueueMessage: (msg) => { storage = [msg]; return Promise.resolve(true)},
        dequeueMessage: () => { return Promise.resolve({messageId:"123"})},
        ackMessage: (msg) => { return Promise.resolve(true) }
      };
      const env = { messageQueue: api };
      messageQueue = reader.run(env);
    });
    it("should return an instantiated api",() => {
      assert(messageQueue.enqueueMessage, "An enqueueMessage method is not defined on the MessageQueue API");
      assert(messageQueue.dequeueMessage, "A dequeueMessage method is not definded on the MessageQueue API");
    });
    describe("MessageQueue ~> enqueueMessage", function() {
      it("should return a Future", () => {
        assert(messageQueue.enqueueMessage(message).fork, "MessageQueue ~> enqueueMessage did not return a future");
      });
      it("should return the same message", function(done){
        messageQueue.enqueueMessage(message).fork(function(err){done(err)},//err callback
          function(result) {
            expect(result).to.equal(message);
            done();
          }
        );
      });
      it("should enqueue the message", function(done){
        messageQueue.enqueueMessage(message).fork(function(err){done(err)},//err callback
          function(result) {
            expect(storage[0]).to.equal(message);
            done();
          }
        );
      });
    });
    describe("MessageQueue ~> dequeueMessage", function() {
      it("should return a Future", () => {
        assert(messageQueue.dequeueMessage().fork, "MessageQueue ~> dequeueMessage did not return a future");
      });
      it("should return a MessageTag", (done) => {
        messageQueue.dequeueMessage().fork(function(err){done(err)},
          function(result) {
            expect(result.messageId).to.equal("123");
            done();
          }
        );
      });
    });
    describe("MessageQueue ~> ackMessage", function() {
      it("should return a Future", () => {
        assert(messageQueue.ackMessage(message).fork, "MessageQueue ~> ackMessage did not return a future");
      });
      it("should return the same message", function(done){
        messageQueue.ackMessage(message).fork(function(err){done(err)},//err callback
          function(result) {
            expect(result).to.equal(message);
            done();
          }
        );
      });
    });
  });
});