import chai from 'chai';
import { createConfig, createServices } from '../src/config';

chai.expect();

const expect = chai.expect;
const assert = chai.assert;

describe("Given an invalid configuration", () => {
  describe("createConfig", function(){
    it("should throw an exception", () => {
      const fn = () => createConfig({});
      expect(fn).to.throw(TypeError);
    });
  });
});

describe("Given a a valid configuration", function(){
  const config = { provider: { name: 'plivo', config: { authId:'123', authToken:'345'}}};
  describe("createConfig", function(){
    const serviceKeys = ['provider','messageStore','messageQueue','cache','rateLimiter','eventBus','idGenerator'];
    it("should return a config object", () => {
      expect(createConfig(config)).not.to.be.null;
    });
    it("with entries for each service", () => {
      expect(createConfig(config)).to.have.all.keys(serviceKeys);
    });
  });
  describe("createServices", function(){
    const serviceKeys = ['smsApi','messageStore','messageQueue','cache','rateLimiter','eventBus','idGenerator'];
    it("should return a container object", () => {
      expect(createServices(createConfig(config))).to.be.a('object');
    });
    it("that contains all configured services", () => {
      const services = createServices(createConfig(config));
      expect(services.toJS()).to.have.all.keys(serviceKeys);
      serviceKeys.forEach((key) => {
        expect(services[key]).not.to.be.null;
      });
    });
  });
});
