const chai = require('chai');
const expect = chai.expect;
const util = require('../../util.js');
const wire = require('../../../../wire');
const examples = require('../../../../rest/controller/ifttt/testExamples.js');
const config = require('config');
const iftttConfig = config.get('ifttt');

let hapiServer;
let db;
let response;

const postTestSetupDefaults = {
  'method': 'POST',
  'url': '/ifttt/v1/test/setup',
  'payload': {},
  'headers': {
    'ifttt-service-key': iftttConfig['service-key'],
    'ifttt-channel-key': iftttConfig['service-key'],
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'Accept-Encoding': 'gzip, deflate',
  },
};

describe('REST IFTTT Test Setup', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    const mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, util.requestStub, iftttConfig);
    app.rest.inbound.ifttt.testRoutes.start();
  });

  beforeEach(async () => {
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  describe('POST /ifttt/v1/test/setup', () => {
    it('should return all trigger examples', async () => {
      await whenRequest(postTestSetupDefaults);

      shouldContain(examples.triggers.samples);
    });
  });
});
async function whenRequest(r) {
  response = await util.sendRequest(r);
}

function shouldContain(data) {
  expect(response.payload.data.samples.triggers).to.deep.equal(data);
}
