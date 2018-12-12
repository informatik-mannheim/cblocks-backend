const chai = require('chai');
const expect = chai.expect;
const util = require('../../util.js');
const wire = require('../../../../wire');
const config = require('config');
const iftttConfig = config.get('ifttt');

let hapiServer;
let db;
let response;

const getStatusDefaults = {
  'method': 'GET',
  'url': '/ifttt/v1/status',
  'headers': {
    'ifttt-service-key': iftttConfig['service-key'],
    'ifttt-channel-key': iftttConfig['service-key'],
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'Accept-Encoding': 'gzip, deflate',
  },
};

describe('REST IFTTT Status', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    const mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, util.requestStub(), iftttConfig);
    app.rest.inbound.ifttt.statusRoutes.start();
  });

  beforeEach(async () => {
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  after(async () => {
    await util.stop();
  });

  describe('GET /ifttt/v1/status', () => {
    it('should return status code 200', async () => {
      await whenRequest(getStatusDefaults);

      statusCodeShouldBe(200);
    });

    it('should return 401 if channel key is invalid', async () => {
      const getStatusWithInvalidChannelKey = {
        ...getStatusDefaults,
        'headers': {
          'ifttt-channel-key': 'INVALID',
        },
      };

      await whenRequest(getStatusWithInvalidChannelKey);

      statusCodeShouldBe(401);
    });
  });
});

async function whenRequest(r) {
  response = await util.sendRequest(r);
}

function statusCodeShouldBe(code) {
  expect(response.raw.statusCode).to.equal(code);
}
