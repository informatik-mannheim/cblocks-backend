const chai = require('chai');
const expect = chai.expect;
const cblockStubs = require('../../stubs/cblocks');
const mappingStubs = require('../../stubs/labelMappings');
const util = require('../util.js');
const wire = require('../../../wire');
const sinon = require('sinon');

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

    const app = wire(mongoClient, mqttClient, db, hapiServer);
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

  describe('output', () => {
    it('should publish mapped value if resource has mapping', async () => {
      await givenLedMapping();
      await givenAgent();

      await whenResourcePublishes(1, JSON.stringify({
        'red': 0,
        'green': 0,
        'blue': 0,
      }));

      await shouldPublishMappedValue('On');

      await whenResourcePublishes(1, JSON.stringify({
        'red': 255,
        'green': 255,
        'blue': 255,
      }));

      await shouldPublishMappedValue('Off');

      await whenResourcePublishes(1, JSON.stringify({
        'red': 255,
        'green': 255,
        'blue': 0,
      }));

      await shouldPublishMappedValue('Undefined');
    });

    it('should do nothing if resource has no mapping', async () => {
      await givenAgent();

      await whenResourcePublishes(0, true);

      shouldNotMap();
    });
  });
});

async function givenLedMapping() {
  await registry.updateObject(cblockStubs.led);
  const m = await dataProvider.createMapping(mappingStubs.ledLabelMapping);

  mappingID = m.mappingID;
}

async function givenAgent() {
  await agent.start();
}

async function whenResourcePublishes(res, val) {
  await agent.onMessage(`3304/0/${res}/output`, String(val));
}

async function shouldPublishMappedValue(val) {
  expect(mqttClient.publish.calledWith(`mappings/label/${mappingID}`, String(val)));
}

function shouldNotMap() {
  expect(mqttClient.publish.calledWith(
    `mappings/label/${mappingID}`, sinon.match.any)).to.be.false;
}
