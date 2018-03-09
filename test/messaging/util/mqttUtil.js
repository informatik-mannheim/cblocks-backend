let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;

let mqttUtil = require('../../../messaging/util/mqttUtil.js')
let ipso = {};

describe("MQTT Util", function(){
  describe("getResourceOutputTopic", function(){
    it("should be of form objectID/instanceID/resourceID/output", function(){
      whenGetResourceOutputTopicForTemperature();

      shouldBeOfIPSOForm();
    })
  })

  function whenGetResourceOutputTopicForTemperature() {
    topic = mqttUtil.getResourceOutputTopic(3303, 0, 1);
  }

  function shouldBeOfIPSOForm() {
    expect(topic).to.equal('3303/0/1/output')
  }

  describe('getResourceInputTopic', function(){
    it('should be of form clientID/objectID/instanceID/resourceID/input', function(){
      whenGetResourceInputTopicForLED()

      shouldBeOfIPSOFormWithClientAndInput()
    })
  })

  function whenGetResourceInputTopicForLED(){
    topic = mqttUtil.getResourceInputTopic("client", 3304, 0, 1);
  }

  function shouldBeOfIPSOFormWithClientAndInput(){
    expect(topic).to.equal('client/3304/0/1/input')
  }

  describe("decomposeResourceTopic", function(){
    it("should decompose for internal inputs and outputs", function(){
      whenDecomposeValidTopic();

      shouldReturnDecomposedTopic();
    })

    it("should throw an exception if resource topic can not be decomposed", function(){
      whenDecomposeInvalidTopicShouldThrowException()
    })
  })

  function whenDecomposeValidTopic(){
    ipso = mqttUtil.decomposeResourceTopic('internal/3303/0/1/output');
  }

  function shouldReturnDecomposedTopic(){
    expect(ipso).to.deep.equal({
      'objectID': 3303,
      'instanceID': 0,
      'resourceID': 1
    })
  }

  function whenDecomposeInvalidTopicShouldThrowException() {
    expect(() => mqttUtil.decomposeResourceTopic('internal/0/1/output')).to.throw("Invalid resource topic.");
    expect(() => mqttUtil.decomposeResourceTopic('internal/3303/0/1')).to.throw("Invalid resource topic.");
  }

  describe("getPublishErrorTopic", function(){
    it('should be IPSO-style with error in the end', function(){
      whenGetErrorTopicForTemperature();

      shouldBeOfIPSOFormWithError();
    })
  })

  function whenGetErrorTopicForTemperature(){
    topic = mqttUtil.getPublishErrorTopic(3303, 0, 1);
  }

  function shouldBeOfIPSOFormWithError(){
    expect(topic).to.be.equal("3303/0/1/output/errors");
  }

  describe("getClientIDInResponseTopic", function(){
    it('should get client if correct format', function(){
      whenGetClientFromValidResponseTopic()

      shouldGetClientID()
    })

    it('should throw error if malformed', function(){
      whenGetClientFromInvalidResponseTopicShouldThrowError()
    })
  })

  function whenGetClientFromValidResponseTopic(){
    clientID = mqttUtil.getClientIDInResponseTopic("mqttFX/responses")
  }

  function shouldGetClientID(){
    expect(clientID).to.equal("mqttFX")
  }

  function whenGetClientFromInvalidResponseTopicShouldThrowError(){
    expect(() => mqttUtil.getClientIDInResponseTopic("mqttFX/asdf")).to.throw("Invalid response topic.")
    expect(() => mqttUtil.getClientIDInResponseTopic("/responses")).to.throw("Invalid response topic.")
  }
})
