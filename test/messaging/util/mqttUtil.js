let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;

let mqttUtil = require('../../../messaging/util/mqttUtil.js')
let ipso = {};

describe("MQTT Util", function(){
  describe("getResourceOutputTopic", function(){
    it("should be of form objectID/instanceID/resourceID", function(){
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

  describe("decomposeResourceTopic", function(){
    it("should decompose for internal inputs and outputs", function(){
      whenDecomposeValidTopic();

      shouldReturnDecomposedTopic();
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
})
