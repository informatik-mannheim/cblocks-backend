const MQTTWriteAgent = require('../messaging/agent/mqttWriteAgent.js');
const MQTTWriter = require('../messaging/writer/mqttWriter.js');
const MQTTMappingAgent = require(
  '../messaging/agent/mqttMappingAgent.js');
const MQTTUtil = require('../messaging/util/mqttUtil.js');
const ResourceOutputRecorderAgent = require(
  '../messaging/agent/resourceOutputRecorderAgent.js');

exports.inbound = (mqttClient, useCases, messagingConfig) => {
    let r = {};

    r.mqttWriteAgent = new MQTTWriteAgent(
      mqttClient, MQTTUtil, useCases.resourceWriteUseCase
    );

    r.mqttCategoryMappingAgent = new MQTTMappingAgent(
      'category',
      mqttClient,
      MQTTUtil,
      useCases.categoryMappingsUseCase,
      useCases.triggers.categoryMappingsUseCase
    );

    r.mqttRangeMappingAgent = new MQTTMappingAgent(
      'range',
      mqttClient,
      MQTTUtil,
      useCases.rangeMappingsUseCase
    );

    r.mqttLabelMappingAgent = new MQTTMappingAgent(
      'label',
      mqttClient,
      MQTTUtil,
      useCases.labelMappingsUseCase
    );

    r.resourceOutputRecorderAgent = new ResourceOutputRecorderAgent(
      mqttClient,
      MQTTUtil,
      useCases.recordResourceOutputUseCase,
      useCases.triggers.newSensorDataUseCase
    );

    return r;
};

exports.outbound = (mqttClient, config) => {
    let r = {};

    r.mqttWriter = new MQTTWriter(mqttClient, MQTTUtil, config.timeoutMs);

    return r;
};
