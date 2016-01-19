import chai from 'chai';
import R from 'ramda';
import Plivo from '../../src/sms-providers/plivo';
import { SmsApi } from '../../src/sms-providers/sms-api';
import SmsMessage from '../../src/messages/sms-message';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

/*
  Set this flag to true and ensure PLIVO_AUTH_ID and PLIVO_AUTH_TOKEN
  are set in your environment to test a live request to the Plivo API
*/
const smoke_test_api = false;

var api, payload;
const validConfig = {
  authId:'123',
  authToken:'456',
  http: {
    get: (url, auth) => Promise.resolve({data:{objects:[{number:"a"},{number:"b"}]}}),
    post: (url, data, auth) => {
      payload = data;
      return Promise.resolve({data:{message_uuid:['1','2']}})
    }
  }
};

describe('Given an invalid configuration', function () {
  describe("attempting to create an API",function() {
    it("should fail", function(){
      var fn = () => Plivo({});
      expect(fn).to.throw(Error);
    });
  });
});

describe("Given a valid configuration", function() {
  describe("creating an API",function(){
    before(()=> api = Plivo(validConfig));
    it("should be succesful",() => {
      expect(api).not.to.be.null;
    });

    describe("getAvailableNumbers", function(){
      it("should return a Promise", function(){
        assert(api.getAvailableNumbers().then);
      });
      it("that settles with phone numbers", (done)=>{
        api.getAvailableNumbers().then(
          function(res){
            expect(res).to.eql(['a','b']);
            done();
          },
          function(err){done(err)}
        );
      });
    });

    var msg;
    describe("sendMessage", function(){
      before(()=>{
        msg = new SmsMessage({id: 'i', from: 'f', to: 't', message: 'm'});
      });
      it("should return a Promise", function(){
        assert(api.sendMessage(msg).then);
      });
      it("supplies a proper payload", (done) => {
        api.sendMessage(msg).then(function(res){
          expect(payload).to.eql({ src: 'f', dst: 't', text: 'm' });
          done();
        });
      });
      it("supplies the callback if provided", (done) => {
        api.sendMessage(msg.set("callbackUrl","cb")).then(function(rest){
          expect(payload).to.eql({ src: 'f', dst: 't', text: 'm', url: 'cb' });
          done();
        });
      });
      it("that settles with a message id", (done) => {
        api.sendMessage(msg).then(
          function(res){
            expect(res).to.eql('1');
            done();
          },
          function(err){done(err)}
        );
      });
    });
  });
});

if (smoke_test_api && process.env.PLIVO_AUTH_ID && process.env.PLIVO_AUTH_TOKEN){
  describe("Given valid API credentials",function(){
    before(function() {
      api = Plivo({
        authId: process.env.PLIVO_AUTH_ID,
        authToken: process.env.PLIVO_AUTH_TOKEN
      });
    });
    it("should fetch numbers from Plivo",(done)=>{
      api.getAvailableNumbers().then(
        (res) => { expect(res).to.be.instanceOf(Array); done(); },
        (err) => { done(err); }
      );
    });
    if(process.env.PLIVO_TEST_SENDER && process.env.PLIVO_TEST_RECIPIENT){
      it("should send a message to Plivo", (done) =>{
        const msg = new SmsMessage({
          id:'id',
          from: process.env.PLIVO_TEST_SENDER,
          to: process.env.PLIVO_TEST_RECIPIENT,
          message:'ho ho ho'
        });
        api.sendMessage(msg).then(
          (res) => { expect(typeof res).to.eq('string'); done(); },
          (err) => { done(err) }
        );
      });
    }
  });
};


