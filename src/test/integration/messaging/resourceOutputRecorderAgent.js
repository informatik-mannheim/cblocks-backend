const chai = require('chai');
const expect = chai.expect;
const util = require('../util.js');
const wire = require('../../../wire');
const sinon = require('sinon');
const config = require('../../../config.js');

let dataProvider;
let agent;
let mqttClient;

describe('Resource Output Recorder Agent', () => {
  const requestStub = util.requestStub();

  before(async () => {
    const mongoClient = await util.getMongo();
    mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, requestStub, config);
    dataProvider = app.dataProviders.resourceOutputDataProvider;
    triggersDataProvider = app.dataProviders.triggersDataProvider;
    agent = app.messaging.inbound.resourceOutputRecorderAgent;
  });

  beforeEach(async () => {
    sinon.spy(requestStub, 'post');

    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  afterEach(() => {
    requestStub.post.restore();
  });


  after(async () => {
    await util.stop();
  });

  it('should save value to database',
    async () => {
      await givenAgent();

      await whenPublishTemperature(25.5);

      await shouldHaveRecords([25.5]); // TODO: add timestamps
  });

  it('should save multiple values', async () => {
    await givenAgent();

    await whenPublishTemperature(25.5);
    await whenPublishTemperature(27);
    await whenPublishTemperature(28);

    await shouldHaveRecords([28, 27, 25.5]);
  });

  it('should call realtime api', async () => {
    await givenAgent();
    await givenTriggerIdentities();

    await whenPublishTemperature(25.5);

    shouldCallRealtimeApi();
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

    const values = records.map((x) => x.value);

    items.forEach((v) => expect(values.includes(v)).to.be.true);
  }

  function givenTriggerIdentities(){
    return triggersDataProvider.updateTriggerIdentity('new_sensor_data', '4711');
  }

  function shouldCallRealtimeApi() {
    expect(requestStub.post.called).to.be.true;
  }
});
