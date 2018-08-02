const chai = require('chai');
const expect = chai.expect;

const mqttUtil = require('../../../../messaging/util/mqttUtil.js');
let ipso = {};
let topic;
let clientID;
let isResponseTopic;

describe('MQTT Util', function() {
  describe('getResourceOutputTopic', function() {
    it('should be of form objectID/instanceID/resourceID/output', function() {
      whenGetResourceOutputTopicForTemperature();

      shouldBeOfIPSOForm();
    });
  });

  function whenGetResourceOutputTopicForTemperature() {
    topic = mqttUtil.getResourceOutputTopic(3303, 0, 1);
  }

  function shouldBeOfIPSOForm() {
    expect(topic).to.equal('3303/0/1/output');
  }

  describe('getInternalResourceInputTopic', function() {
    it('should be of ipso form', function() {
      whenGetResourceInputTopicForLED();

      shouldBeOfIPSOFormWithClientAndInput();
    });
  });

  function whenGetResourceInputTopicForLED() {
    topic = mqttUtil.getInternalResourceInputTopic('client', 3304, 0, 1);
  }

  function shouldBeOfIPSOFormWithClientAndInput() {
    expect(topic).to.equal('internal/client/3304/0/1/input');
  }

  describe('decomposeResourceOutputTopic', function() {
    it('should decompose internal outputs', function() {
      whenDecomposeInternalOutput();

      shouldReturnDecomposedOutputTopic();
    });

    it('should decompose external outputs', () => {
      whenDecomposeExternalOutput();

      shouldReturnDecomposedOutputTopic();
    });

    it('should throw an exception if topic can not be decomposed', function() {
      whenDecomposeInvalidTopicShouldThrowException();
    });
  });

  function whenDecomposeInternalOutput() {
    ipso = mqttUtil.decomposeResourceOutputTopic('internal/3303/0/1/output');
  }

  function shouldReturnDecomposedOutputTopic() {
    expect(ipso).to.deep.equal({
      'objectID': 3303,
      'instanceID': 0,
      'resourceID': 1,
    });
  }

  function whenDecomposeExternalOutput() {
    ipso = mqttUtil.decomposeResourceOutputTopic('3303/0/1/output');
  }

  function whenDecomposeInvalidTopicShouldThrowException() {
    expect(() => mqttUtil.decomposeResourceOutputTopic('internal/0/1/output'))
      .to.throw('Invalid resource topic.');

    expect(() => mqttUtil.decomposeResourceOutputTopic('internal/3303/0/1'))
      .to.throw('Invalid resource topic.');
  }

  describe('decomposeResourceInputTopic', function() {
    it('should decompose input', function() {
      whenDecomposeInput();

      shouldReturnDecomposedInputTopic();
    });

    it('should fail if client id in input is missing', function() {
      whenDecomposeInputWithoutClientIDShouldThrowException();
    });
  });

  function whenDecomposeInput() {
    ipso = mqttUtil.decomposeResourceInputTopic('mqttFX/3303/0/1/input');
  }

  function shouldReturnDecomposedInputTopic() {
    expect(ipso).to.deep.equal({
      'clientID': 'mqttFX',
      'objectID': 3303,
      'instanceID': 0,
      'resourceID': 1,
    });
  }

  function whenDecomposeInputWithoutClientIDShouldThrowException() {
    expect(() => mqttUtil.decomposeResourceOutputTopic('3303/0/1/input'))
      .to.throw('Invalid resource topic.');
  }

  describe('getPublishErrorTopic', function() {
    it('should be IPSO-style with error in the end', function() {
      whenGetErrorTopicForTemperature();

      shouldBeOfIPSOFormWithError();
    });
  });

  function whenGetErrorTopicForTemperature() {
    topic = mqttUtil.getPublishErrorTopic(3303, 0, 1);
  }

  function shouldBeOfIPSOFormWithError() {
    expect(topic).to.be.equal('3303/0/1/output/errors');
  }

  describe('getClientIDInResponseTopic', function() {
    it('should get client if correct format', function() {
      whenGetClientFromValidResponseTopic();

      shouldGetClientID();
    });

    it('should throw error if malformed', function() {
      whenGetClientFromInvalidResponseTopicShouldThrowError();
    });
  });

  function whenGetClientFromValidResponseTopic() {
    clientID = mqttUtil.getClientIDInResponseTopic('mqttFX/responses');
  }

  function shouldGetClientID() {
    expect(clientID).to.equal('mqttFX');
  }

  function whenGetClientFromInvalidResponseTopicShouldThrowError() {
    expect(() => mqttUtil.getClientIDInResponseTopic('mqttFX/asdf'))
      .to.throw('Invalid response topic.');
    expect(() => mqttUtil.getClientIDInResponseTopic('/responses'))
      .to.throw('Invalid response topic.');
  }

  describe('getWriteResponseTopic', function() {
    it('should be of format clientID/responses', function() {
      whenGetWriteResponseTopic();

      shouldHaveCorrectResponseTopic();
    });
  });

  function whenGetWriteResponseTopic() {
    topic = mqttUtil.getWriteResponseTopic('mqttFX');
  }

  function shouldHaveCorrectResponseTopic() {
    expect(topic).to.equal('mqttFX/responses');
  }

  describe('isResponseTopic', function() {
    it('should return true for response topic', function() {
      whenIsValidResponseTopic();

      shouldReturnTrue();
    });
  });

  function whenIsValidResponseTopic() {
    isResponseTopic = mqttUtil.isResponseTopic('mqttFX/responses');
  }

  function shouldReturnTrue() {
    expect(isResponseTopic).to.be.true;
  }
});
