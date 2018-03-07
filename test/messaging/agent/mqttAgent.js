let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;
chai.use(chaiAsPromised);
let sinon = require('sinon');

let client = {};
let util = require('../../../messaging/util/mqttUtil.js');
let MQTTAgent = require('../../../messaging/agent/mqttAgent.js');
let mqttAgent = {};
let resourcePublisherUseCase = {};
let promise;

describe('MQTT Agent', function(){
  describe('start', function(){
    it('should subscribe to resource outputs and listen for messages', function(){
      givenMQTTAgent();

      whenStart();

      shouldSubscribeToResourceOutputs();
      shouldListenToMessages();
    })

    // it('delegates publish to use case and does nothing if successfull', function(){
    //   givenSuccessfullPublisher();
    //   givenMQTTAgent();
    //
    //   whenTemperatureSensorChange
    // })
  })

  function givenMQTTAgent() {
    client.subscribe = sinon.spy();
    client.on = sinon.spy();

    mqttAgent = new MQTTAgent(client, util, resourcePublisherUseCase);
  }

  function whenStart() {
    mqttAgent.start();
  }

  function shouldSubscribeToResourceOutputs(){
    expect(client.subscribe.getCall(0).args[0]).to.equal('internal/+/+/+/output');
  }

  function shouldListenToMessages() {
    expect(client.on.calledOnce).to.be.true;
  }
})
