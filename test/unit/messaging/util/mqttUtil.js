const chai = require('chai');
const expect = chai.expect;

const mqttUtil = require('../../../../messaging/util/mqttUtil.js');
let value;

describe('MQTT Util', function() {
  describe('getResourceOutputTopic', function() {
    it('should be of form objectID/instanceID/resourceID/output', function() {
      whenGetResourceOutputTopicForTemperature();

      shouldBeOfIPSOForm();
    });
  });

  describe('getInternalResourceInputTopic', function() {
    it('should be of ipso form', function() {
      whenGetResourceInputTopicForLED();

      shouldBeOfIPSOFormWithClientAndInput();
    });
  });

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

  describe('decomposeResourceInputTopic', function() {
    it('should decompose input', function() {
      whenDecomposeInput();

      shouldReturnDecomposedInputTopic();
    });

    it('should fail if client id in input is missing', function() {
      whenDecomposeInputWithoutClientIDShouldThrowException();
    });
  });

  describe('getPublishErrorTopic', function() {
    it('should be IPSO-style with error in the end', function() {
      whenGetErrorTopicForTemperature();

      shouldBeOfIPSOFormWithError();
    });
  });

  describe('getClientIDInResponseTopic', function() {
    it('should get client if correct format', function() {
      whenGetClientFromValidResponseTopic();

      shouldGetClientID();
    });

    it('should throw error if malformed', function() {
      whenGetClientFromInvalidResponseTopicShouldThrowError();
    });
  });

  describe('getWriteResponseTopic', function() {
    it('should be of format clientID/responses', function() {
      whenGetWriteResponseTopic();

      shouldHaveCorrectResponseTopic();
    });
  });

  describe('isResponseTopic', function() {
    it('should return true for response topic', function() {
      whenIsValidResponseTopic();

      shouldReturn(true);
    });
  });

  describe('isInputTopic', () => {
    it('should return true for clientID/3303/0/0/input', () => {
      whenIsInputTopicWith('clientID/3303/0/0/input');

      shouldReturn(true);
    });

    it('should return false for 3303/0/input', () => {
      whenIsInputTopicWith('3303/0/input');

      shouldReturn(false);
    });
  });

  describe('isOutputTopic', () => {
    it('should return true for 3303/0/0/output', () => {
      whenIsOutputTopicWith('3303/0/0/output');

      shouldReturn(true);
    });

    it('should return false for 3303/0/output', () => {
      whenIsOutputTopicWith('3303/0/input');

      shouldReturn(false);
    });
  });

  describe('getMappingsInputTopic', () => {
    it('should return mappings/category/3303/input for id 3303 and type category', () => {
      whenGetMappingInputTopicWith(3303, 'category');

      shouldReturn('mappings/category/3303/input');
    });
  });

  describe('isMappingInputTopic', () => {
    it('should return true for mappings/category/3303/input', () => {
      whenIsMappingInputTopicWith('mappings/category/3303/input');

      shouldReturn(true);
    });

    it('should return false for mappings/3303/input', () => {
      whenIsMappingInputTopicWith('mappings/3303/input');

      shouldReturn(false);
    });

    it('should return false for mappings/category/input', () => {
      whenIsMappingInputTopicWith('mappings/category/input');

      shouldReturn(false);
    });

    it('should return false for mappings/category/3303/output', () => {
      whenIsMappingInputTopicWith('mappings/category/3303/output');

      shouldReturn(false);
    });

    it('should return false for /mappings/category/3303/input', () => {
      whenIsMappingInputTopicWith('/mappings/category/3303/output');

      shouldReturn(false);
    });
  });
});

function whenGetResourceOutputTopicForTemperature() {
  value = mqttUtil.getResourceOutputTopic(3303, 0, 1);
}

function shouldBeOfIPSOForm() {
  expect(value).to.equal('3303/0/1/output');
}

function whenGetResourceInputTopicForLED() {
  value = mqttUtil.getInternalResourceInputTopic('client', 3304, 0, 1);
}

function shouldBeOfIPSOFormWithClientAndInput() {
  expect(value).to.equal('internal/client/3304/0/1/input');
}

function whenDecomposeInternalOutput() {
  value = mqttUtil.decomposeResourceOutputTopic('internal/3303/0/1/output');
}

function shouldReturnDecomposedOutputTopic() {
  expect(value).to.deep.equal({
    'objectID': 3303,
    'instanceID': 0,
    'resourceID': 1,
  });
}

function whenDecomposeExternalOutput() {
  value = mqttUtil.decomposeResourceOutputTopic('3303/0/1/output');
}

function whenDecomposeInvalidTopicShouldThrowException() {
  expect(() => mqttUtil.decomposeResourceOutputTopic('internal/0/1/output'))
    .to.throw('Invalid resource topic.');

  expect(() => mqttUtil.decomposeResourceOutputTopic('internal/3303/0/1'))
    .to.throw('Invalid resource topic.');
}

function whenDecomposeInput() {
  value = mqttUtil.decomposeResourceInputTopic('mqttFX/3303/0/1/input');
}

function shouldReturnDecomposedInputTopic() {
  expect(value).to.deep.equal({
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

function whenGetErrorTopicForTemperature() {
  value = mqttUtil.getPublishErrorTopic(3303, 0, 1);
}

function shouldBeOfIPSOFormWithError() {
  expect(value).to.be.equal('3303/0/1/output/errors');
}

function whenGetClientFromValidResponseTopic() {
  value = mqttUtil.getClientIDInResponseTopic('mqttFX/responses');
}

function shouldGetClientID() {
  expect(value).to.equal('mqttFX');
}

function whenGetClientFromInvalidResponseTopicShouldThrowError() {
  expect(() => mqttUtil.getClientIDInResponseTopic('mqttFX/asdf'))
    .to.throw('Invalid response topic.');
  expect(() => mqttUtil.getClientIDInResponseTopic('/responses'))
    .to.throw('Invalid response topic.');
}

function whenGetWriteResponseTopic() {
  value = mqttUtil.getWriteResponseTopic('mqttFX');
}

function shouldHaveCorrectResponseTopic() {
  expect(value).to.equal('mqttFX/responses');
}

function whenIsValidResponseTopic() {
  value = mqttUtil.isResponseTopic('mqttFX/responses');
}

function shouldReturn(val) {
  expect(value).to.equal(val);
}

function whenIsInputTopicWith(val) {
  value = mqttUtil.isInputTopic(val);
}

function whenIsOutputTopicWith(val) {
  value = mqttUtil.isOutputTopic(val);
}

function whenGetMappingInputTopicWith(mappingID, type) {
  value = mqttUtil.getMappingsInputTopic(mappingID, type);
}

function whenIsMappingInputTopicWith(topic) {
  value = mqttUtil.isMappingInputTopic(topic);
}
