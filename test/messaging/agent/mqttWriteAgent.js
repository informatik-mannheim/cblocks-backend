const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');

const client = {};
const util = require('../../../messaging/util/mqttUtil.js');
const MQTTWriteAgent = require('../../../messaging/agent/mqttWriteAgent.js');
const ResourceWriteError =
  require('../../../use-cases/resource-write/resourceWriteError.js');
let mqttWriteAgent = {};
const resourceWriteUseCase = {};
let isInputMessage;

describe('MQTTWriteAgent', function() {
  describe('start', function() {
    it('should subscribe to resource inputs', function() {
      givenMQTTWriteAgent();

      whenStart();

      shouldSubsribeToResourceInputs();
      shouldHandleMessages();
    });
  });

  function givenMQTTWriteAgent() {
    client.on = sinon.spy();
    client.subscribe = sinon.spy();
    client.publish = sinon.spy();

    mqttWriteAgent = new MQTTWriteAgent(client, util, resourceWriteUseCase);
  }

  function whenStart() {
    mqttWriteAgent.start();
  }

  function shouldSubsribeToResourceInputs() {
    expect(client.subscribe.calledWithMatch('+/+/+/+/input')).to.be.true;
  }

  function shouldHandleMessages() {
    expect(client.on.calledWithMatch('message')).to.be.true;
  }

  describe('_isInputTopic', function() {
    it('returns true for input topic', function() {
      givenMQTTWriteAgent();

      whenIsInputTopic();

      shouldReturnTrue();
    });

    it('returns false for output topic', function() {
      givenMQTTWriteAgent();

      whenIsOutputTopic();

      shouldReturnFalse();
    });
  });

  function whenIsInputTopic() {
    isInputMessage = mqttWriteAgent._isInputTopic('mqttFX/3303/0/0/input');
  }

  function shouldReturnTrue() {
    expect(isInputMessage).to.be.true;
  }

  function whenIsOutputTopic() {
    isInputMessage = mqttWriteAgent._isInputTopic('3303/0/0/output');
  }

  function shouldReturnFalse() {
    expect(isInputMessage).to.be.false;
  }

  describe('_onMessage', function() {
    it('should delegate publish to use case', function() {
      givenSuccessfullWrite();
      givenMQTTWriteAgent();

      whenValidWriteRequest();

      shouldCallWriteUseCase();
    });

    it('should do nothing on write success', function() {
      givenSuccessfullWrite();
      givenMQTTWriteAgent();

      whenValidWriteRequest();

      shouldNotPublishAnything();
    });

    it('should publish error on write failure', function(done) {
      givenWriteFailure();
      givenMQTTWriteAgent();

      whenValidWriteRequest();

      shouldPublishErrorMessage(done);
    });

    it('should not publish error if there is no requestID', function(done) {
      givenWriteFailure();
      givenMQTTWriteAgent();

      whenWriteRequestWithNoRequestID();

      shouldNotPublishError(done);
    });
  });

  function givenSuccessfullWrite() {
    resourceWriteUseCase.write = sinon.stub().resolves();
  }

  function whenValidWriteRequest() {
    mqttWriteAgent._onMessage('mqttFX/3304/0/0/input', JSON.stringify({
      'requestID': 4711,
      'data': true,
    }));
  }

  function shouldCallWriteUseCase() {
    expect(resourceWriteUseCase.write.calledWith('mqttFX', 3304, 0, 0, {
      'requestID': 4711,
      'data': true,
    })).to.be.true;
  }

  function shouldNotPublishAnything() {
    expect(client.publish.called).to.be.false;
  }

  function givenWriteFailure() {
    resourceWriteUseCase.write = sinon.stub()
      .rejects(new ResourceWriteError('Something went wrong.'));
  }

  function shouldPublishErrorMessage(done) {
    setTimeout(() => {
      expect(client.publish.calledWith('mqttFX/responses', JSON.stringify({
        'requestID': 4711,
        'success': false,
        'message': 'Something went wrong.',
      }))).to.be.true;

      done();
    }, 20);
  }

  function whenWriteRequestWithNoRequestID() {
    mqttWriteAgent._onMessage('mqttFX/3304/0/0/input', JSON.stringify({
      'data': true,
    }));
  }

  function shouldNotPublishError(done) {
    setTimeout(() => {
      expect(client.publish.called).to.be.false;

      done();
    }, 20);
  }
});
