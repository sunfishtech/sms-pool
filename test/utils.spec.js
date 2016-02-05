import chai from 'chai';
import { promiseToFuture, MemoryCache, pipeObs, validateObject, Schema } from '../src/utils';
import { Future, Either } from 'ramda-fantasy';
import Joi from 'joi';
import { Observable } from 'rx';

const { validate, string, number } = Joi;
chai.expect();

const expect = chai.expect;
const assert = chai.assert;

describe("Given a set of observable returning functions", function(){
  let fns;
  before(() => {
    fns = [(a,b) => Observable.just(["1",a,b]), (c) => Observable.just(["2",c]), (d) => Observable.just(["3",d])];
  }); 
  describe("pipeObs", function(){
    it("should compose the functions into a single observable returning function", () => {
      expect(pipeObs(...fns)).to.be.a('function');
    });
    it("should return a composed observable when executed",()=>{
      const fn = pipeObs(...fns);
      assert(fn(1,2).subscribe, `${fn(1,2)} does not appear to be a future`);
    });
    it("should provide the composed value when subscribed", (done) => {
      const fn = pipeObs(...fns);
      const obs = fn(1,2);
      obs.subscribe(
        (result) => {
          expect(result).to.eql(["3",["2",["1",1,2]]]);
          done();
        }, err => done(err)
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
