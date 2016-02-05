import chai from 'chai';
import SmsPool from '../src/sms-pool';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

describe("Given an SmsPool", () => {
  describe("with invalid configuration", function(){
    it("should not instantiate a pool", () => {
      const fn = () => SmsPool({});
      expect(fn).to.throw(TypeError);
    });
  });
  describe("with a valid configuration", function(){
    let config = { provider: { name: 'plivo', config: { authId:'123', authToken:'345'}}};
    it("should instantiate an SmsPool", () => {
      expect(SmsPool(config)).not.to.be.null;
    });
    it("should expose the service registry", function(){
      expect(SmsPool(config).services).not.to.be.null;
    }); 
    it("should expose an event bus", function(){
      expect(SmsPool(config).events).to.respondTo('subscribe');
    });
    it("should expose a dispose method", function(){
      expect(SmsPool(config)).to.respondTo('dispose');
    })
    it("should provide a sendMessage method", function(){
      expect(SmsPool(config)).to.respondTo('sendMessage');
    });
  });
  describe("SmsPool ~> sendMessage", function(){
    let pool = null;
    before(() => { pool = SmsPool({
      provider: { name:'mock_provider'},
      rateLimiter: { name: 'rate_limiter', config: { max:1000, period:1}}
    })});
    it("should return an Observable", () => {
      expect(pool.sendMessage({})).to.respondTo('subscribe');
    });
    it("should fail with an invalid message", (done) => {
      pool.sendMessage({}).subscribeOnError(err => {
        expect(err).not.to.be.null;
        done();
      });
    });
    it("should publish a MessageEnqueued event", (done) => {
      pool.sendMessage({to:'you', message:'hi'}).subscribe(
        res => { 
          expect(res.messageId).not.to.be.null;
          done();
        }, err => done(err)
      );
    });
    it("should send enqueued message", (done) => {
       let s = pool.events.subscribe('sentMessages',
        res => {
          s.dispose();
          expect(pool.services.smsApi.sentMessages[0].status).to.eql('REQUESTED');
          done();
        }, err => done(err)
      );
      pool.sendMessage({to:'you',message:'hi'}).subscribe(()=>{});
    });
    it("should broadcast sent messages", (done) => {
      let s = pool.events.subscribe('sentMessages',
        res => {
          s.dispose();
          expect(res.message.status).to.eql('SENT');
          done();
        }, err => done(err)
      );
      pool.sendMessage({to:'you',message:'hi'}).subscribe(()=>{});
    });
  });
});