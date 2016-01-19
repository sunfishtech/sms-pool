import chai from 'chai';
import { promiseToFuture, MemoryCache, pipeF } from '../src/utils';
import { Future } from 'ramda-fantasy';
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

var cache;
describe("Given a MemoryCache", function(){
  before(() => cache = new MemoryCache());
  describe("MemoryCache ~> get", function(){
    it("should return the result of the value function the first access",()=>{
      let ctr = 0;
      expect(cache.get("ctr", ()=>++ctr)).to.equal(1);
    });
    it("should return the cached value subsequent accesses", ()=> {
      let ctr = 0;
      let valf = () => ++ctr;
      cache.get("ctr",valf);
      cache.get("ctr",valf);
      cache.get("ctr",valf);
      expect(cache.get("ctr",valf)).to.equal(1);
    });
  });
  describe("MemoryCache ~> set", function(){
    it("should set the value of the cache for the given key",()=>{
      cache.set("ctr",999);
      expect(cache.get("ctr",()=>0)).to.equal(999);
      cache.set("ctr",1000);
      expect(cache.get("ctr",()=>0)).to.equal(1000);
    });
  });
  describe("MemoryCache ~> remove", function(){
    it("should remove the provided key",()=>{
      cache.set("ctr",1);
      cache.remove("ctr");
      expect(cache.get("ctr",()=>999)).to.equal(999);
    });
  });
  describe("MemoryCache ~> clear", function(){
    it("should clear the cache",()=>{
      cache.set("ctr",1);
      cache.set("ctr2",2);
      cache.clear();
      expect(cache.get("ctr",()=>999)).to.equal(999);
      expect(cache.get("ctr2",()=>1000)).to.equal(1000);
    });
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