import chai from 'chai';
import * as sms from '../lib/sms-pool.js';
import { Future } from 'ramda-fantasy';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var lib;
var reader, future;

describe("Given fetchAvailableNumbers",function(){
  describe("when executed",function(){
    before(() => reader = sms.fetchAvailableNumbers());
    it("should return a Reader",() => {
      //testing for run method. Not sure how else to do it.
      assert(reader.run);
    });

    describe("that when run against an environment", function() {
      before(() => {
        const env = {
          smsApi: { getAvailableNumbers: () => Promise.resolve(['a','b','c'])}
        };
        future = reader.run(env);
      });
      it("should return a future", () => {
        assert(future.fork);
      });
      describe("that when forked",function(){
        it("should return an AvailableNumbers message", function(done){
          future.fork(function(err){done(err)},//err callback
            function(result) {
              expect(result.numbers.toJS()).to.eql(['a','b','c']);
              done();
            }
          );
        });
      });
    });
  });
});

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
