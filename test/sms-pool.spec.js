import chai from 'chai';
import SmsPool from '../src/sms-pool';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

describe("Given an SmsPool", () => {
  describe("with invalid configuration", function(){
    it("should not instantiate a pool", () => {
      const fn = () => SmsPool({});
      expect(fn).to.throw(TypeError);
    });
  });
  describe("with a valid configuration", function(){
    let config = { provider: { name: 'plivo', config: { authId:'123', authToken:'345'}}};
    it("should instantiate an SmsPool", () => {
      expect(SmsPool(config)).not.to.be.null;
    });  
  });
});