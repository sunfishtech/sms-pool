import chai from 'chai';
import NumberPool from '../src/number-pool.js';
import { Future } from 'ramda-fantasy';
import { SmsMessage } from '../src/messages';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var reader, numberPool, message;

describe("Given a NumberPool",function(){
  before(() => {
      reader = new NumberPool();
  });
  
  it("should be a Reader", () => { assert(reader.run, "NumberPool() does not return a reader")});

  describe("when run against an environment",function(){
    before(() => {
      const api = { getAvailableNumbers: () => Promise.resolve(['a','b','c'])};
      const env = { smsApi: api };
      numberPool = reader.run(env);
    });
    it("should return an instantiated api",() => {
      assert(numberPool.availableNumbers, "An availableNumbers method is not defined on the NumberPool API");
      assert(numberPool.appendFromIfMissing, "An appendFromIfMissing method is not defined on the NumberPool API");
    });
    describe("NumberPool ~> availableNumbers", function() {
      it("should return a Future", () => {
        assert(numberPool.availableNumbers().fork, "NumberPool ~> availableNumbers did not return a future");
      });
      it("that should return an AvailableNumbers message", function(done){
        numberPool.availableNumbers().fork(function(err){done(err)},//err callback
          function(result) {
            expect(result.numbers.toJS()).to.eql(['a','b','c']);
            done();
          }
        );
      });
    });
    describe("NumberPool ~> appendFromIfMissing", function(){
      before(() => message = new SmsMessage({
        id:'id',from:'f',to:'t',message:'m'
      }));
      it("should return a Future", () => {
        assert(numberPool.appendFromIfMissing(message).fork);
      });
      describe("when provided an SmsMessage with a 'from' field",function(){
        it("should not modify the message", (done) => {
          numberPool.appendFromIfMissing(message).fork(
            function(err){ done(err) },
            function(res) {
              expect(res).to.equal(message);
              done();
            }
          );
        });
      });
      describe("when provided an SmsMessage without a 'from' field", function(){
        before(() => message = message.remove('from'));
        it("should append a from number to the message", (done) => {
          numberPool.appendFromIfMissing(message).fork(
            function(err){ done(err) },
            function(res) {
              expect(res).not.to.equal(message);
              expect(res.from).not.to.equal('f');
              done();
            }
          );
        });
      });
    });
  });
});