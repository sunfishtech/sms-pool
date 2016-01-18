import chai from 'chai';
import * as sms from '../lib/sms-pool.js';
import { Future } from 'ramda-fantasy';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var lib;
var reader, future;

var msg;
describe("Given am SmsMessage", function(){
  before(() =>
    msg = new sms.Messages.SmsMessage({
      id:'i', from:'1', to:'2', message:'message'
    })
  );
  describe("sendMessage",function(){
    before(() => reader = sms.sendMessage(msg));
    it("should return a Reader",() => {
      assert(reader.run);
    });
  });
  describe("when run against an environment", function() {
    before(() => {
      const env = {
        smsApi: { sendMessage: (message) => Promise.resolve('123')}
      };
      future = reader.run(env);
    });
    it("should return a future", () => {
      assert(future.fork, "Reader.run did not return a future");
    });
    describe("that when forked (heh heh he said forked)",function(){
      it("should return a MessageAccepted message", (done) => {
        future.fork(function(err){done(err)},
          function(result) {
            expect(result.vendorId).to.eql('123');
            done();
          }
        );
      });
    })
  });
});
