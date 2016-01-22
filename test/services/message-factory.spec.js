import chai from 'chai';
import MessageFactory from '../../src/services/message-factory.js';
import { Future } from 'ramda-fantasy';
import { SmsMessage } from '../../src/messages';
import { Typed } from 'typed-immutable';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

var reader, factory;
const message = {to:'to',message:'msg', from:'me'};

describe("Given a MessageFactory",function(){
  before(() => {
      reader = MessageFactory();
  });
  
  it("should be a Reader", () => expect(reader).to.respondTo('run'));

  describe("when run against an environment",function(){
    before(() => {
      const api = { next: () => '12345' };
      const env = { idGenerator: api };
      factory = reader.run(env);
    });
    it("should return an instantiated api",() => expect(factory).to.respondTo('create'));
    
    describe("MessageFactory ~> create", function() {
      it("should return a Future", () => {
        expect(factory.create(SmsMessage, 'id', message)).to.respondTo('fork');
      });
      it("should create an SmsMessage", (done) => {
        factory.create(SmsMessage, 'id', message).fork((err) => done(err),
          (resp) => {
            expect(resp[Typed.typeName]()).to.equal('SmsMessage');
            done();
          }
        );
      });
      it("should generate the id", (done) => {
        factory.create(SmsMessage, 'id', message).fork((err) => done(err),
          (resp) => {
            expect(resp.id).to.equal('12345');
            done();
          }
        );
      });
      it("should fail the future if given bad data", (done) => {
        factory.create(SmsMessage, 'id', {}).fork(
          (err) => {
            expect(err.toString()).to.contain("Invalid value");
            done();
          }
        );
      });
    })
  });
});