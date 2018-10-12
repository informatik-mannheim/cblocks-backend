const chai = require('chai');
const expect = chai.expect;
const cblockStubs = require('../../stubs/cblocks');
const mappingStubs = require('../../stubs/rangeMappings');
const util = require('../util.js');
const wire = require('../../../wire');
const sinon = require('sinon');

let registry;
let dataProvider;
let agent;
let mqttClient;
let mappingID;

describe('Range mapping agent', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer);
    registry = app.dataProviders.registry;
    dataProvider = app.dataProviders.rangeMappingsDataProvider;
    agent = app.messaging.inbound.mqttRangeMappingAgent;
});

  beforeEach(async () => {
    sinon.spy(mqttClient, 'publish');
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  afterEach(() => {
    mqttClient.publish.restore();
  });

  describe('output', () => {
    it('should publish mapped value if resource has mapping', async () => {
      await givenTemperatureMapping();
      await givenAgent();

      await whenResourcePublishesValue(25);

      await shouldPublishMappedValue(50);
    });

    it('should do nothing if resource has no mapping', async () => {
      await givenAgent();

      await whenResourcePublishesValue(15);

      shouldNotMap();
    });
  });

  describe('input', () => {
    describe('given temperature mappings', () => {
      it('should publish matching value within boundaries', async () => {
        await givenTemperatureMapping();
        await givenAgent();

        await whenServiceCallsInputWith(50);

        await shouldPublishCommand(0, 25);
      });

      it('should publish upper bound for 100 %', async () => {
        await givenTemperatureMapping();
        await givenAgent();

        await whenServiceCallsInputWith(100);

        await shouldPublishCommand(0, 30);
      });

      it('should publish lower bound for 0 %', async () => {
        await givenTemperatureMapping();
        await givenAgent();

        await whenServiceCallsInputWith(0);

        await shouldPublishCommand(0, 20);
      });
    });

    describe('given no mappings', () => {
      it('should do nothing', async () => {
        await givenAgent();

        await whenServiceCallsInputWith(50);

        shouldNotPublishCommand(0);
      });
    });
  });
});

async function givenTemperatureMapping() {
  await registry.updateObject(cblockStubs.temperature);
  let m = await dataProvider.createMapping(mappingStubs.temperatureRangeMapping);

  mappingID = m.mappingID;
}

async function givenAgent() {
  await agent.start();
}

async function whenResourcePublishesValue(val) {
  await agent.onMessage('3303/0/0/output', String(val));
}

async function shouldPublishMappedValue(val) {
  expect(mqttClient.publish.calledWith(`mappings/range/${mappingID}/output`, String(val)));
}

function shouldNotMap() {
  expect(mqttClient.publish.calledWith(
    `mappings/range/${mappingID}/output`, sinon.match.any)).to.be.false;
}

async function whenServiceCallsInputWith(val) {
  await agent.onMessage(`mappings/range/${mappingID}/input`, String(val));
}

async function shouldPublishCommand(res, val) {
  const commandValue = JSON.stringify({
    'data': String(val),
  });

  expect(mqttClient.publish.calledWith(
    `internal/service/3303/0/${res}/input`, commandValue)).to.be.true;
}

async function shouldNotPublishCommand(res) {
  expect(mqttClient.publish.calledWith(
    `internal/service/3303/0/${res}/input`, sinon.match.any)).to.be.false;
}
