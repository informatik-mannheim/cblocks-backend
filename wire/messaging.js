const MQTTWriteAgent = require('../messaging/agent/mqttWriteAgent.js');
const MQTTWriter = require('../messaging/writer/mqttWriter.js');
const MQTTMappingAgent = require(
  '../messaging/agent/mqttMappingAgent.js');
const MQTTUtil = require('../messaging/util/mqttUtil.js');

const config = require('config');
const writeConfig = config.get('write');

exports.inbound = (mqttClient, useCases) => {
    let r = {};

    r.mqttWriteAgent = new MQTTWriteAgent(
      mqttClient, MQTTUtil, useCases.resourceWriteUseCase
    );

    r.mqttCategoryMappingAgent = new MQTTMappingAgent(
      mqttClient, MQTTUtil, useCases.categoryMappingsUseCase
    );

    r.mqttRangeMappingAgent = new MQTTMappingAgent(
      mqttClient, MQTTUtil, useCases.rangeMappingsUseCase
    );

    return r;
};

exports.outbound = (mqttClient) => {
    let r = {};

    r.mqttWriter = new MQTTWriter(mqttClient, MQTTUtil, writeConfig.timeout_ms);

    return r;
};
