import chai from 'chai';
import MessageSender from '../../src/services/message-sender.js';
import { Future } from 'ramda-fantasy';
import { SmsMessage, SmsMessageStatus } from '../../src/messages';
import RateLimiter from '../../src/services/rate-limiter';

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
      const api = { sendMessage: (msg) => { sent = msg; return Promise.resolve('123456')} };
      const env = { smsApi: api, rateLimiter: RateLimiter(1000,1) };
      messageSender = reader.run(env);
    });
    it("should return an instantiated api",() => {
      assert(messageSender.sendMessage, "A sendMessage method is not defined on the MessageSender API");
    });
    describe("MessageSender ~> sendMessage", function() {
      it("should return a Future", () => {
        assert(messageSender.sendMessage(message).fork, "MessageSender ~> sendMessage did not return a future");
      });
      it("should set the status to sent", function(done){
        messageSender.sendMessage(message).fork(function(err){done(err)},//err callback
          function(result) {
            expect(result.status).to.equal(SmsMessageStatus.SENT);
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
      it("should set the vendors identifier", function(done){
        messageSender.sendMessage(message).fork(function(err){done(err)},//err callback
          function(result) {
            expect(result.vendorId).to.equal('123456');
            done();
          }
        );
      });
    });
  });
});