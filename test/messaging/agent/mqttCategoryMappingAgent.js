const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');

const Agent = require('../../../messaging/agent/mqttCategoryMappingAgent.js');
let agent = {};
let useCase = {};
let client = {};
const util = require('../../../messaging/util/mqttUtil.js');
const mappingStubs = require('../../stubs/categoryMappings');

describe('MQTTCategoryMappingAgent', () => {
  beforeEach(() => {
    agent = {};
    useCase = {};
    useCase.applyMapping = sinon.spy();
    useCase.registerOnUpdateMappings = sinon.spy();

    client = {};
  });

  describe('start', () => {
    it('should subscribe to all resources with mappings',
      startShouldSubscribeToAllResourcesWithMappings);
  });

  describe('onUpdateMappings', () => {
    it('should subscribe to all resources with mappings',
      onUpdateMappingShouldSubscribeToAllResourcesWithMappings);
  });

  describe('onMessage', () => {
    it('should apply mapping if resource has one',
      onMessageShouldApplyMappingIfResourceHasOne);

    it('should not apply mapping if resouce has no mapping',
      onMessageShouldNotApplyMappingIfResourceHasNone);
  });
});

async function startShouldSubscribeToAllResourcesWithMappings() {
  givenTemperatureAndHumidityMapppings();
  givenAgent();

  await whenStart();

  shouldSubscribeToAllObjectResources();
}

function givenTemperatureAndHumidityMapppings() {
  useCase.getCategoryMappings = sinon.stub().resolves([
    mappingStubs.temperatureCategoryMapping,
    mappingStubs.humidityCategoryMapping,
  ]);
}

function givenAgent() {
  client.subscribe = sinon.spy();
  client.on = sinon.spy();
  client.publish = sinon.spy();

  agent = new Agent(client, util, useCase);
}

function whenStart() {
  return promise = agent.start();
}

function shouldSubscribeToAllObjectResources() {
  expect(client.subscribe.calledWith('3303/0/0/output')).to.be.true;
  expect(client.subscribe.calledWith('3304/0/0/output')).to.be.true;
}

async function onUpdateMappingShouldSubscribeToAllResourcesWithMappings() {
  givenTemperatureAndHumidityMapppings();
  givenAgent();

  await whenOnUpdateMappings();

  shouldSubscribeToAllObjectResources();
}

function whenOnUpdateMappings() {
  return promise = agent.onUpdateMappings();
}

async function onMessageShouldApplyMappingIfResourceHasOne() {
  givenTemperatureAndHumidityMapppings();
  givenTemperatureMappingReturnsMedium();
  givenAgent();

  await whenStart();
  await whenOnMessageForTemperatureSensor();

  shouldApplyMapping();
  shouldWriteResultIntoMappingTopic();
}

function givenTemperatureMappingReturnsMedium() {
  useCase.applyMapping = sinon.stub().returns('Medium');
}

async function whenOnMessageForTemperatureSensor() {
  await agent.onMessage('3303/0/0/output', 25);
}

function shouldApplyMapping() {
  expect(useCase.applyMapping.calledWith(4711, 25)).to.be.true;
}

function shouldWriteResultIntoMappingTopic() {
  expect(client.publish.calledWith('mappings/4711', 'Medium')).to.be.true;
}

async function onMessageShouldNotApplyMappingIfResourceHasNone() {
  givenTemperatureAndHumidityMapppings();
  givenAgent();

  await whenStart();
  whenOnMessageForSensorWithNoMapping();

  shouldNotApplyMapping();
}

function whenOnMessageForSensorWithNoMapping() {
  agent.onMessage('3303/99/0/output', 25);
}

function shouldNotApplyMapping() {
  expect(useCase.applyMapping.called).to.be.false;
}
