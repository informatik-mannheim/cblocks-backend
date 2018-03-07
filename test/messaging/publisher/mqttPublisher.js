let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;
chai.use(chaiAsPromised);
let sinon = require('sinon');

let client = {};
let util = require('../../../messaging/util/mqttUtil.js');
let MQTTPublisher = require('../../../messaging/publisher/mqttPublisher.js');
let mqttPublisher = {};
let promise;

describe("MQTT Publisher", function(){
  describe("publishResourceValue", function(){
    it('should resolve', function(){
      givenMQTTPublisher();

      whenPublishTemperature();

      shouldResolve();
    })
  })

  function givenMQTTPublisher(){
    client.publish = sinon.spy();
    
    mqttPublisher = new MQTTPublisher(client, util);
  }

  function whenPublishTemperature(){
    promise = mqttPublisher.publishResourceValue(3303, 0, 0, 33.2);
  }

  function shouldResolve() {
    expect(promise).to.be.fulfilled;
  }
})
