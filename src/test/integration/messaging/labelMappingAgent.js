const chai = require('chai');
const expect = chai.expect;
const cblockStubs = require('../../stubs/cblocks');
const mappingStubs = require('../../stubs/labelMappings');
const util = require('../util.js');
const wire = require('../../../wire');
const sinon = require('sinon');
const config = require('../../../config.js');

let registry;
let dataProvider;
let agent;
let mqttClient;
let mappingID;

describe('Label mapping agent', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, util.requestStub(), config);
    registry = app.dataProviders.registry;
    dataProvider = app.dataProviders.labelMappingsDataProvider;
    agent = app.messaging.inbound.mqttLabelMappingAgent;
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

  after(async () => {
    await util.stop();
  });

  describe('output', () => {
    it('should publish mapped value if resource has mapping', async () => {
      await givenMapping(cblockStubs.led, mappingStubs.ledLabelMapping);
      await givenAgent();

      await whenResourcePublishes(3304, 1, 1, JSON.stringify({
        'red': 0,
        'green': 0,
        'blue': 0,
      }));

      await shouldPublishMappedValue('On');
    });

    it('should do nothing if resource has no mapping', async () => {
      await givenAgent();

      await whenResourcePublishes(3304, 1, 0, true);

      shouldNotMap();
    });

    it('should published mapped value for rfid mapping', async () => {
      await givenMapping(cblockStubs.rfid, mappingStubs.wineLabelMapping);
      await givenAgent();

      await whenResourcePublishes(3305, 0, 0, "459b4c2d45481");

      await shouldPublishMappedValue('Rotwein');
    });
  });

  describe('input', () => {
    describe('given mapping exists', () => {
      it('should publish mapped value if label exists', async () => {
        await givenMapping(cblockStubs.led, mappingStubs.ledLabelMapping);
        await givenAgent();

        await whenServiceCallsInputWith('On');

        await shouldPublishCommand(1,
          mappingStubs.ledLabelMapping.labels[1].value);
      });

      it('should publish no value if label does not exist', async () => {
        await givenMapping(cblockStubs.led, mappingStubs.ledLabelMapping);
        await givenAgent();

        await whenServiceCallsInputWith('Something');

        await shouldNotPublishCommand(1);
      });
    });

    describe('given mapping does not exist', () => {
      it('should do nothing', async () => {
        await givenAgent();

        await whenServiceCallsInputWith('On');

        await shouldNotPublishCommand(1);
      });
    });
  });
});

async function givenMapping(o, m) {
  await registry.updateObject(o);
  m = await dataProvider.createMapping(m);

  mappingID = m.mappingID;
}

async function givenAgent() {
  await agent.start();
}

async function whenResourcePublishes(objectID, instance, resource, val) {
  await agent.onMessage(`${objectID}/${instance}/${resource}/output`, String(val));
}

async function shouldPublishMappedValue(val) {
  expect(mqttClient.publish.calledWith(`mappings/label/${mappingID}/output`, String(val)));
}

function shouldNotMap() {
  expect(mqttClient.publish.calledWith(
    `mappings/label/${mappingID}/output`, sinon.match.any)).to.be.false;
}

async function whenServiceCallsInputWith(val) {
  await agent.onMessage(`mappings/label/${mappingID}/input`, String(val));
}

async function shouldPublishCommand(res, val) {
  const commandValue = JSON.stringify({
    'data': val,
  });

  expect(mqttClient.publish.calledWith(
    `internal/service/3304/1/${res}/input`, commandValue)).to.be.true;
}

async function shouldNotPublishCommand(res) {
  expect(mqttClient.publish.calledWith(
    `internal/service/3304/0/${res}/input`, sinon.match.any)).to.be.false;
}
