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

    const app = wire(mongoClient, mqttClient, db, hapiServer, util.requestStub);
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

  it('should publish mapped value for temperature', async () => {
    await givenMapping(mappingStubs.temperatureCategoryMapping);
    await givenAgent();

    await whenResourcePublishesValue(0, 15);

    await shouldPublishMappedValue('Low');
  });

  it('should publish mapped value for humidity', async () => {
    await givenMapping(mappingStubs.humidityCategoryMapping);
    await givenAgent();

    await whenResourcePublishesValue(1, 31);

    await shouldPublishMappedValue('Medium');
  });

  it('should do nothing if resource has no mapping', async () => {
    await givenAgent();

    await whenResourcePublishesValue(15);

    shouldNotMap();
  });
});

async function givenMapping(mapping) {
  await registry.updateObject(cblockStubs.temperature);

  let m = await dataProvider.createMapping(mapping);
  mappingID = m.mappingID;
}

async function givenAgent() {
  await agent.start();
}

async function whenResourcePublishesValue(resourceID, val) {
  await agent.onMessage(`3303/0/${resourceID}/output`, String(val));
}

async function shouldPublishMappedValue(val) {
  expect(mqttClient.publish.calledWith(`mappings/category/${mappingID}/output`, val))
    .to.be.true;
}

function shouldNotMap() {
  expect(mqttClient.publish.calledWith(
    `mappings/category/${mappingID}/output`, sinon.match.any)).to.be.false;
}
