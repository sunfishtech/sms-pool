import chai from 'chai';
import { MemoryStore } from '../../../src/services/in-memory';

chai.expect();

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;
const assert = chai.assert;

describe("Given a MemoryStore", function(){
  var store;
  beforeEach(() => store = MemoryStore());
  describe("put then get", function(){
    it("should return the same object", (done)=>{
      store.put({id:'1'}).then(() => {
        store.get('1').then((res)=>{
          expect(res).to.eql({id:'1'});
          done();
        });
      })
    });
  });
});