import chai from 'chai';
import { Messages } from '../../src/index.js';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

const {
  SmsMessage,
  SmsMessageStatus,
  AvailableNumbers
} = Messages;

describe('Given a suite of messages', function () {
  describe("when instantiated", function () {
    it ("should create an SmsMessage", () => {
      const validData = {id:"id",to:"to",message:"message"};
      assert(new SmsMessage(validData));
    });
    it ("should not create an invalid SmsMessage", () => {
      var fn = () => new SmsMessage({});
      expect(fn).to.throw(Error);
    });
    it ("should create an AvailableNumbers", () => {
      assert(new AvailableNumbers());
      assert(new AvailableNumbers({numbers:['1','2','3']}));
    });
    it ("should not create an invalid AvailableNumbers", () => {
      var fn = () => new AvailableNumbers({numbers:[1,2,3]});
      expect(fn).to.throw(Error);
    });
  });
});
