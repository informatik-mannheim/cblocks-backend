let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;
chai.use(chaiAsPromised);
let sinon = require('sinon');

let client = {};
let util = require('../../../messaging/util/mqttUtil.js');
let MQTTPublishAgent = require('../../../messaging/agent/mqttPublishAgent.js');
let mqttPublishAgent = {};
let resourcePublisherUseCase = {};
let promise;

describe('MQTT Agent', function(){
  describe('start', function(){
    it('should subscribe to resource outputs and listen for messages', function(){
      givenMQTTPublishAgent();

      whenStart();

      shouldSubscribeToResourceOutputs();
      shouldListenToMessages();
    })
  })

  function givenMQTTPublishAgent() {
    client.publish = sinon.spy();
    client.subscribe = sinon.spy();
    client.on = sinon.spy();

    mqttPublishAgent = new MQTTPublishAgent(client, util, resourcePublisherUseCase);
  }

  function whenStart() {
    mqttPublishAgent.start();
  }

  function shouldSubscribeToResourceOutputs(){
    expect(client.subscribe.getCall(0).args[0]).to.equal('internal/+/+/+/output');
  }

  function shouldListenToMessages() {
    expect(client.on.calledOnce).to.be.true;
  }

  describe('_onMessage', function(){
    it('delegates publish to use case and does nothing if successfull', function(done){
      givenSuccessfullPublisher();
      givenMQTTPublishAgent();

      whenTemperatureSensorChange();

      shouldCallResourcePublisherUseCase(done);
    })

    it('delegates publish to use case and publishes error message if failure', function(done){
      givenUnsuccessfullPublisher();
      givenMQTTPublishAgent();

      whenTemperatureSensorChange();

      shouldPublishErrorMessage(done);
    })
  })

  function givenSuccessfullPublisher(){
    resourcePublisherUseCase.publish = sinon.stub();
    resourcePublisherUseCase.publish.resolves();
  }

  function whenTemperatureSensorChange() {
    mqttPublishAgent._onMessage("internal/3303/0/0/output", 33.2);
  }

  function shouldCallResourcePublisherUseCase(done){
    setTimeout(function () {
      expect(resourcePublisherUseCase.publish.calledWith(3303, 0, 0, 33.2)).to.be.true;
      done()
    }, 20);
  }

  function givenUnsuccessfullPublisher(){
    resourcePublisherUseCase.publish = sinon.stub();
    resourcePublisherUseCase.publish.rejects(new Error("Some Error."));
  }

  function shouldPublishErrorMessage(done){
    setTimeout(function () {
      expect(client.publish.called).to.be.true;
      done()
    }, 20);
  }
})
