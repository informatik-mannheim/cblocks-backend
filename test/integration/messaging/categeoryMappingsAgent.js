const chai = require('chai');
const expect = chai.expect;
const cblockStubs = require('../../stubs/cblocks');
const mappingStubs = require('../../stubs/categoryMappings');
const util = require('../util.js');
const wire = require('../../../wire');
const sinon = require('sinon');

let registry;
let dataProvider;
let agent;
let mqttClient;
let mappingID;

describe('Category mapping agent', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer);
    registry = app.dataProviders.registry;
    dataProvider = app.dataProviders.categoryMappingsDataProvider;
    agent = app.messaging.inbound.mqttCategoryMappingAgent;
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

  it('should publish mapped value if resource has mapping', async () => {
    await givenMapping();
    await givenAgent();

    await whenResourcePublishesValue(15);

    await shouldPublishMappedValue('Low');
  });

  it('should do nothing if resource has no mapping', async () => {
    await givenAgent();

    await whenResourcePublishesValue(15);

    shouldNotMap();
  });
});

async function givenMapping() {
  let m = await registry.updateObject(cblockStubs.temperature);
  mappingID = m.mappingID;
  await dataProvider.createMapping(mappingStubs.temperatureCategoryMapping);
}

async function givenAgent() {
  await agent.start();
}

async function whenResourcePublishesValue(val) {
  await agent.onMessage('3303/0/0/output', String(val));
}

async function shouldPublishMappedValue(val) {
  expect(mqttClient.publish.calledWith(`mappings/category/${mappingID}`, val));
}

function shouldNotMap() {
  expect(mqttClient.publish.calledWith(
    `mappings/category/${mappingID}`, sinon.match.any)).to.be.false;
}
