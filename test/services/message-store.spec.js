import chai from 'chai';
import MessageStore from '../../src/services/message-store.js';
import { Future } from 'ramda-fantasy';
import { SmsMessage } from '../../src/messages';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var reader, messageStore, storage;
const message = new SmsMessage({id:'id',to:'to',message:'msg'});

describe("Given a MessageStore",function(){
  before(() => {
      reader = MessageStore();
  });
  
  it("should be a Reader", () => { assert(reader.run, "MessageStore() does not return a reader")});

  describe("when run against an environment",function(){
    before(() => {
      const api = {
        put: (msg) => { storage = [msg]; return Promise.resolve(true)},
        get: (id) => { return Promise.resolve({[id]:message}[id]) }
      };
      const env = { messageStore: api };
      messageStore = reader.run(env);
    });
    it("should return an instantiated api",() => {
      assert(messageStore.storeMessage, "An storeMessage method is not defined on the MessageStore API");
    });
    describe("MessageStore ~> storeMessage", function() {
      it("should return a Future", () => {
        assert(messageStore.storeMessage(message).fork, "MessageStore ~> storeMessage did not return a future");
      });
      it("should return the same message", function(done){
        messageStore.storeMessage(message).fork(function(err){done(err)},//err callback
          function(result) {
            expect(result).to.equal(message);
            done();
          }
        );
      });
      it("should store the message", function(done){
        messageStore.storeMessage(message).fork(function(err){done(err)},//err callback
          function(result) {
            expect(storage[0]).to.equal(message);
            done();
          }
        );
      });
    });
    describe("MessageStore ~> getMessage", function() {
      it("should return a Future", () => {
        assert(messageStore.getMessage('123').fork, "MessageStore ~> getMessage did not return a future");
      });
      it("should return a message", function(done){
        messageStore.getMessage('123').fork(function(err){done(err)},//err callback
          function(result) {
            expect(result.toJS()).to.eql(message.toJS());
            done();
          }
        );
      });
    });
  });
});