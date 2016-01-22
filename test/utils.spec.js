import chai from 'chai';
import { promiseToFuture, MemoryCache, pipeF, validateObject, Schema } from '../src/utils';
import { Future, Either } from 'ramda-fantasy';
import Joi from 'joi';
const { validate, string, number } = Joi;
chai.expect();

const expect = chai.expect;
const assert = chai.assert;

describe("Given a function that returns a Promise", function(){
  describe("promiseToFuture", function(){
    it("should return a Future",() => {
      const F = promiseToFuture(() => Promise.resolve(true));
      assert(F.fork, "no Future was returned");
    });
    it("should resolve the future value when forked",(done)=>{
      const F = promiseToFuture(() => Promise.resolve("skippy dippy"));
      F.fork(
        (err) => done(err),
        (res) => {
          expect(res).to.equal("skippy dippy");
          done();
        }
      );
    })
  });
});

describe("Given a set of future returning functions", function(){
  let fns;
  before(() => {
    fns = [(a,b) => Future.of(["1",a,b]), (c) => Future.of(["2",c]), (d) => Future.of(["3",d])];
  }); 
  describe("pipeF", function(){
    it("should compose the functions into a single future returning function", () => {
      expect(pipeF(...fns)).to.be.a('function');
    });
    it("should return a composed future when executed",()=>{
      const fn = pipeF(...fns);
      assert(fn(1,2).fork, `${fn(1,2)} does not appear to be a future`);
    });
    it("should provide the composed value when forked", (done) => {
      const fn = pipeF(...fns);
      const future = fn(1,2);
      future.fork((err) => done(err),
        (result) => {
          expect(result).to.eql(["3",["2",["1",1,2]]]);
          done();
        }
      );
    });
  }); 
});

describe("Given a Joi schema", function(){
  let schema, validate;
  before(() => {
    schema = Schema({
      name: string().required(),
      age: number().required()
    });
    validate = validateObject(schema, {});
  });
  describe("validateObject", function(){
    describe("applied to an invalid input", function(){
      it("should return a Left", () => {
        expect(validate({}).isLeft).to.be.true;
      });
      it("that brought a few errors home from the party", () => {
        expect(validate({}).value.toString())
          .to.contain('"name" is required')
          .and.to.contain('"age" is required');
      });
    });
    describe("applied to a valid input", function(){
      it("should return a Right", () => {
        expect(validate({name:'hi',age:1}).isRight).to.be.true;        
      });
      it("should return the original object", () => {
        const obj = {name:'hi', age:1};
        expect(validate(obj).value).to.eql(obj);
      });
    });
  });
});
