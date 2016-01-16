import chai from 'chai';
import R from 'ramda';
import Plivo from '../../src/vendors/plivo';
import { SmsApi } from '../../src/vendors/sms-api';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

/*
  Set this flag to true and ensure PLIVO_AUTH_ID and PLIVO_AUTH_TOKEN
  are set in your environment to test a live request to the Plivo API
*/
const smoke_test_api = false;

var api;
const validConfig = {
  authId:'123',
  authToken:'456',
  http: {
    get: (url) => Promise.resolve({data:{objects:[{number:"a"},{number:"b"}]}})
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
      it("should return a Future",function(){
        expect(api.getAvailableNumbers().fork).to.be.function;
      });
      it("that settles with phone numbers", (done)=>{
        api.getAvailableNumbers().fork(
          function(err){console.log(err)},
          function(res){
            expect(res).to.eql(['a','b']);
            done();
          }
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
      api.getAvailableNumbers().fork(
        (err) => { done(err); },
        (res) => { expect(res).to.be.instanceOf(Array); done(); }
      );
    });
  });
};


