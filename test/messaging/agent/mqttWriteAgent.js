let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;
chai.use(chaiAsPromised);
let sinon = require('sinon');

let client = {};
let util = require('../../../messaging/util/mqttUtil.js');
let MQTTWriteAgent = require('../../../messaging/agent/mqttWriteAgent.js');
let mqttWriteAgent = {};
let resourceWriteUseCase = {};
let promise;

describe("MQTTWriteAgent", function(){
  describe("start", function(){
    it("should subscribe to resource inputs", function(){
      givenMQTTWriteAgent()

      whenStart()

      shouldSubsribeToResourceInputs()
      shouldHandleMessages()
    })
  })

  function givenMQTTWriteAgent(){
    client.on = sinon.spy()
    client.subscribe = sinon.spy()

    mqttWriteAgent = new MQTTWriteAgent(client, util, resourceWriteUseCase)
  }

  function whenStart(){
    mqttWriteAgent.start()
  }

  function shouldSubsribeToResourceInputs(){
    expect(client.subscribe.calledWithMatch('+/+/+/+/input')).to.be.true;
  }

  function shouldHandleMessages(){
    expect(client.on.calledWithMatch('message')).to.be.true;
  }

  describe('_isInputTopic', function(){
    it('returns true for input topic', function(){
      givenMQTTWriteAgent()

      whenIsInputTopic();

      shouldReturnTrue();
    })

    it('returns false for output topic', function(){
      givenMQTTWriteAgent()

      whenIsOutputTopic();

      shouldReturnFalse();
    })
  })

  function whenIsInputTopic(){
    isInputMessage = mqttWriteAgent._isInputTopic("mqttFX/3303/0/0/input")
  }

  function shouldReturnTrue(){
    expect(isInputMessage).to.be.true;
  }

  function whenIsOutputTopic(){
    isInputMessage = mqttWriteAgent._isInputTopic("3303/0/0/output")
  }

  function shouldReturnFalse(){
    expect(isInputMessage).to.be.false;
  }

  describe('_onMessage', function(){
    it('should delegate publish to use case', function(){
      givenSuccessfullWrite()
      givenMQTTWriteAgent()

      whenValidWriteRequest()

      shouldCallWriteUseCase()
    })
  })

  function givenSuccessfullWrite(){
    resourceWriteUseCase.write = sinon.stub().resolves();
  }

  function whenValidWriteRequest(){
    promise = mqttWriteAgent._onMessage('mqttFX/3304/0/0/input', JSON.stringify({
      'requestID': 4711,
      'data': true
    }))
  }

  function shouldCallWriteUseCase(){
    expect(resourceWriteUseCase.write.calledWith('mqttFX', 3304, 0, 0,  {
      'requestID': 4711,
      'data': true
    })).to.be.true;
  }
})
