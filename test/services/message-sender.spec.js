import chai from 'chai';
import MessageSender from '../../src/services/message-sender.js';
import { Future } from 'ramda-fantasy';
import { SmsMessage } from '../../src/messages';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var reader, messageSender, sent;
const message = new SmsMessage({id:'id',to:'to',message:'msg'});

describe("Given a MessageSender",function(){
  before(() => {
      reader = MessageSender();
  });
  
  it("should be a Reader", () => { assert(reader.run, "MessageSender() does not return a reader")});

  describe("when run against an environment",function(){
    before(() => {
      const api = { sendMessage: (msg) => { sent = msg; return Promise.resolve(true)} };
      const env = { smsApi: api };
      messageSender = reader.run(env);
    });
    it("should return an instantiated api",() => {
      assert(messageSender.sendMessage, "A sendMessage method is not defined on the MessageSender API");
    });
    describe("MessageSender ~> sendMessage", function() {
      it("should return a Future", () => {
        assert(messageSender.sendMessage(message).fork, "MessageSender ~> sendMessage did not return a future");
      });
      it("should return the same message", function(done){
        messageSender.sendMessage(message).fork(function(err){done(err)},//err callback
          function(result) {
            expect(result).to.equal(message);
            done();
          }
        );
      });
      it("should send the message", function(done){
        messageSender.sendMessage(message).fork(function(err){done(err)},//err callback
          function(result) {
            expect(sent).to.equal(message);
            done();
          }
        );
      });
    });
  });
});