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
          smsApi: { getAvailableNumbers: () => Future.of(['a','b','c'])}
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
