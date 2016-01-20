import chai from 'chai';
import { MemoryCache } from '../../../src/services/in-memory';
chai.expect();

const expect = chai.expect;
const assert = chai.assert;

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
  describe("MemoryCache ~> has", function(){
    it("should return false with no entry", () => {
      expect(cache.has("ctrz")).to.be.false;
    });
    it("should return true with an entry", () => {
      cache.set("ctrz", false);
      expect(cache.has("ctrz")).to.be.true;
    });
  });
});