const chai = require('chai');
const expect = chai.expect;
const stubs = require('../../stubs/cblocks');
const util = require('../util.js');
const wire = require('../../../wire');
const sinon = require('sinon');

let dataProvider;
let agent;
let mqttClient;

describe('Resource Output Recorder Agent', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer);
    dataProvider = app.dataProviders.resourceOutputDataProvider;
    agent = app.messaging.inbound.resourceOutputRecorderAgent;
  });

  beforeEach(async () => {
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  it('should save value to database',
    async () => {
      await givenAgent();

      await whenPublishTemperature(25.5);

      await shouldHaveRecords([25.5]);
  });

  it('should save multiple values', async () => {
    await givenAgent();

    await whenPublishTemperature(25.5);
    await whenPublishTemperature(27);
    await whenPublishTemperature(28);

    await shouldHaveRecords([25.5, 27, 28]);
  });
});

async function givenAgent() {
  await agent.start();
}

function whenPublishTemperature(value) {
  return agent._onMessage('3303/0/0/output', value);
}

async function shouldHaveRecords(items) {
  const records = await dataProvider.getRecords({
    'objectID': 3303,
    'instanceID': 0,
    'resourceID': 0,
  });

  expect(records).to.deep.equal(items);
}
