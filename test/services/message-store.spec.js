import chai from 'chai';
import MessageStore from '../../src/services/message-store.js';
import { Future } from 'ramda-fantasy';
import { SmsMessage } from '../../src/messages';
import { Observable } from 'rx';

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
        put: (msg) => { storage = [msg]; return Observable.just(msg)},
        get: (id) => { return Observable.just({[id]:message}[id]) }
      };
      const env = { messageStore: api };
      messageStore = reader.run(env);
    });
    it("should return an instantiated api",() => {
      expect(messageStore).to.respondTo('storeMessage');
    });
    describe("MessageStore ~> storeMessage", function() {
      it("should return an Observable", () => {
        expect(messageStore.storeMessage(message)).to.respondTo('subscribe');
      });
      it("should return the same message", function(done){
        messageStore.storeMessage(message).subscribe(
          function(result) {
            expect(result).to.equal(message);
            done();
          }
        );
      });
      it("should store the message", function(done){
        messageStore.storeMessage(message).subscribe(
          function(result) {
            expect(storage[0]).to.equal(message);
            done();
          }
        );
      });
    });
    describe("MessageStore ~> getMessage", function() {
      it("should return an Observable", () => {
        expect(messageStore.getMessage('123')).to.respondTo('subscribe');
      });
      it("should return a message", function(done){
        messageStore.getMessage('123').subscribe(
          function(result) {
            expect(result.toJS()).to.eql(message.toJS());
            done();
          }
        );
      });
    });
  });
});