const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const mappingStubs = require('../../../../stubs/labelMappings');
const ObjectID = require('mongodb').ObjectID;
const util = require('../../../util.js');
const wire = require('../../../../../wire');
const config = require('../../../../../config.js');

let mqttClient;
let hapiServer;
let db;
let response;

const postMappingDefaults = {
  'method': 'POST',
  'url': '/ifttt/v1/actions/label_mappings',
  'payload': {
    "actionFields": {
      "from": "On",
      "mapping_id": "4711"
    },
    'user': {
      'timezone': 'America/Los_Angeles',
    },
    'ifttt_source': {
      'id': 'ef60200717723142',
      'url': 'http://example.com/ef60200717723142',
    },
  },
  'headers': {
    'ifttt-service-key': config.ifttt['service-key'],
    'ifttt-channel-key': config.ifttt['service-key'],
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'Accept-Encoding': 'gzip, deflate',
  },
};

describe('REST IFTTT Label Mapping Agent', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, util.requestStub(), config);

    dataProvider = app.dataProviders.labelMappingsDataProvider;
    app.rest.inbound.ifttt.actions.labelMappingRoutes.start();
  });

  beforeEach(async () => {
    sinon.spy(mqttClient, 'publish');
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  afterEach(async () => {
    mqttClient.publish.restore();
  })

  after(async () => {
    await util.stop();
  });

  describe('POST /ifttt/v1/actions/label_mappings', () => {
    it('should respond with id', async () => {
      const mappingID = await givenMapping(mappingStubs.ledLabelMapping)

      const request = {...postMappingDefaults};
      request.payload.actionFields.mapping_id = mappingID;

      await whenRequest(request);

      statusCodeShouldBe(200);
      shouldOnlyContainID();
    });

    it('should publish command', async () => {
      const mappingID = await givenMapping(mappingStubs.ledLabelMapping)

      const request = {...postMappingDefaults};
      request.payload.actionFields.mapping_id = mappingID;

      await whenRequest(request);

      shouldPublish('internal/service/3304/0/1/input');
    })
  });
});

async function givenMapping(m) {
  const r = await dataProvider.createMapping(m);

  return r.mappingID;
}


async function whenRequest(r) {
  response = await util.sendRequest(r);
}

function statusCodeShouldBe(code) {
  expect(response.raw.statusCode).to.equal(code);
}

function shouldOnlyContainID(){
  response.payload.data.map(i => expect(i.id).not.to.be.null)
}

function shouldPublish(topic){
  expect(mqttClient.publish.calledWith(topic)).to.be.true;
}