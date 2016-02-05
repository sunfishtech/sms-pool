import chai from 'chai';
import MessageSender from '../../src/services/message-sender.js';
import { SmsMessage, SmsMessageStatus } from '../../src/messages';
import RateLimiter from '../../src/services/rate-limiter';
import { Observable } from 'rx';

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
      const api = { sendMessage: (msg) => { sent = msg; return Observable.just('123456')} };
      const env = { smsApi: api, rateLimiter: RateLimiter(1000,1) };
      messageSender = reader.run(env);
    });
    it("should return an instantiated api",() => {
      assert(messageSender.sendMessage, "A sendMessage method is not defined on the MessageSender API");
    });
    describe("MessageSender ~> sendMessage", function() {
      it("should return an Observable", () => {
        assert(messageSender.sendMessage(message).subscribe, "MessageSender ~> sendMessage did not return an Observable");
      });
      it("should set the status to sent", function(done){
        messageSender.sendMessage(message).subscribe(
          function(result) {
            expect(result.status).to.equal(SmsMessageStatus.SENT);
            done();
          }, (err) => done(err)
        );
      });
      it("should send the message", function(done){
        messageSender.sendMessage(message).subscribe(
          function(result) {
            expect(sent).to.equal(message);
            done();
          }, function(err){done(err)}
        );
      });
      it("should set the vendors identifier", function(done){
        messageSender.sendMessage(message).subscribe(
          function(result) {
            expect(result.vendorId).to.equal('123456');
            done();
          }, function(err){done(err)}
        );
      });
    });
  });
});