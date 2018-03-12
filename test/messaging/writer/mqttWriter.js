let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;
chai.use(chaiAsPromised);
let sinon = require('sinon');

let client = {};
let util = require('../../../messaging/util/mqttUtil.js');
let MQTTWriter = require('../../../messaging/writer/mqttWriter.js');
let mqttWriter = {};
let promise;

describe('MQTTWriter', function(){
  describe('constructor', function(){
    it('should subscribe to response topics', function(){
      givenMQTTWriter();

      shouldSubscribeToResponseTopics();
    })
  })

  function givenMQTTWriter() {
    client.subscribe = sinon.spy();
    client.publish = sinon.spy();
    client.on = sinon.spy()

    mqttWriter = new MQTTWriter(client, util)
  }

  function shouldSubscribeToResponseTopics(){
    expect(client.subscribe.calledWith('+/responses')).to.be.true;
  }

  describe('writeResourceValue', function(){
    it('should resolve anyways if no request id is provided', function(){
      givenMQTTWriter();

      whenWriteResourceValueWithNoRequestID();

      shouldCallPublishWithoutRequestID()
      shouldResolve()
    })

    it('should reject with timeout if cblock does not respond', function(){
      givenMQTTWriter();

      whenWriteResourceValueWithRequestID()

      shouldCallPublishWithRequestID()
      shouldRejectWithTimeout()
    })

    it('should resolve if cblock responds', function(){
      givenMQTTWriter()

      whenWriteResourceValueWithRequestID()

      shouldCallPublishWithRequestID()

      whenCBlockRespondsWithSuccessToRequestID()

      shouldResolve()
    })
  })

  function whenWriteResourceValueWithNoRequestID(){
    promise = mqttWriter.writeResourceValue("client", 3304, 0, 0, {
      "data": true
    });
  }

  function shouldCallPublishWithoutRequestID(){
    expect(client.publish.calledWith('internal/client/3304/0/0/input', JSON.stringify({
      "data": true
    }))).to.be.true;
  }

  function shouldCallPublishWithRequestID(){
    expect(client.publish.calledWith('internal/client/3304/0/0/input', JSON.stringify({
      "requestID": 4711,
      "data": true
    }))).to.be.true;
  }

  function shouldResolve(){
    expect(promise).to.be.fulfilled
  }

  function whenWriteResourceValueWithRequestID(){
    promise = mqttWriter.writeResourceValue("client", 3304, 0, 0, {
      "requestID": 4711,
      "data": true
    });
  }

  function shouldRejectWithTimeout(){
    expect(promise).to.be.rejectedWith("Timeout.")
  }

  function whenCBlockRespondsWithSuccessToRequestID(){
    let f = mqttWriter._onMessage('client/responses', JSON.stringify({
      'success': true,
      'requestID': 4711,
      'message': ''
    }))
  }
})
