import chai from 'chai';
import { LevelDbStore } from '../../../src/services/persistent';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var store;

describe("Given a LevelDbStore", function(){
  before(() => {
    store = LevelDbStore(); store.init();
  });
  after(() => { if (store) store.dispose();});
  describe("put then get", function() {
    it("should return the same object", (done)=>{
      store.put({id:'1'}).flatMap(_ => 
        store.get('1').do(res => {
          expect(res).to.eql({id:'1'});
          done();
        }) 
      ).subscribe(_=>{});
    });
  });
});