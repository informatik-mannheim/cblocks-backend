const chai = require('chai');
const expect = chai.expect;
const util = require('../../util.js');
const wire = require('../../../../wire');
const examples = require('../../../../rest/controller/ifttt/testExamples.js');

let hapiServer;
let db;
let response;

const postTestSetupDefaults = {
  'method': 'POST',
  'url': '/ifttt/v1/test/setup',
  'payload': {},
  'headers': {
    'IFTTT-Service-Key': '{{4Crt0huozALk7UOl-D5V6gEajUfN6twav9m2i8NGJ5x6i1Gy2fSHm8R_cpMEab-M}}',
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

    const app = wire(mongoClient, mqttClient, db, hapiServer);
    app.rest.ifttt.testRoutes.start();
  });

  beforeEach(async () => {
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  describe('POST /ifttt/v1/test/setup', () => {
    it('should return all trigger examples', async () => {
      await whenRequest(postTestSetupDefaults);

      shouldContain(examples.triggers);
    });
  });
});
async function whenRequest(r) {
  response = await util.sendRequest(r);
}

function shouldContain(data) {
  expect(response.payload.data.samples.triggers).to.deep.equal(data);
}
