const chai = require('chai');
const expect = chai.expect;
const util = require('../../util.js');
const wire = require('../../../../wire');
const config = require('config');
const iftttConfig = config.get('ifttt');

let hapiServer;
let db;
let response;

const postNewSensorDataDefaults = {
  'method': 'POST',
  'url': '/ifttt/v1/triggers/new_sensor_data',
  'payload': {
    'trigger_identity': '737ea7ac0bf6b45236002b72e7a6e99a5bf1c1d8',
    'triggerFields': {
      'object_id': '3303',
      'instance_id': '0',
      'resource_id': '0',
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
    'ifttt-service-key': iftttConfig['service-key'],
    'ifttt-channel-key': iftttConfig['service-key'],
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'Accept-Encoding': 'gzip, deflate',
  },
};

describe('REST IFTTT Triggers', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    const mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, iftttConfig);

    dataProvider = app.dataProviders.resourceOutputDataProvider;
    app.rest.ifttt.triggersRoutes.start();
  });

  beforeEach(async () => {
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  describe('POST /ifttt/v1/triggers/new_sensor_data', () => {
    it('should return latest readings', async () => {
      const records = [25, 26, 27, 28, 23];
      await Promise.all(givenRecords(records));

      await whenRequest(postNewSensorDataDefaults);

      statusCodeShouldBe(200);
      shouldReturnRecords(5);
    });

    it('should return 2 if limit is 2', async () => {
      const records = [25, 26, 27, 28, 23];
      await Promise.all(givenRecords(records));

      const request = {
        ...postNewSensorDataDefaults,
        'payload': {
          ...postNewSensorDataDefaults.payload,
          'limit': 2,
        },
      };

      await whenRequest(request);

      statusCodeShouldBe(200);
      shouldReturnRecords(2);
    });
  });
});

function givenRecords(records) {
  const recordPromises = records.map((x) => {
    return dataProvider.record({
      'objectID': 3303,
      'instanceID': 0,
      'resourceID': 0,
    }, {
      'timestamp': Date.now(),
      'value': x,
    });
  });

  return recordPromises;
}

async function whenRequest(r) {
  response = await util.sendRequest(r);
}

function statusCodeShouldBe(code) {
  expect(response.raw.statusCode).to.equal(code);
}

function shouldReturnRecords(numberOfRecords) {
  expect(response.payload.data.length).to.equal(numberOfRecords);

  response.payload.data.forEach((x) => {
    expect(x['object_id']).to.equal(3303);
    expect(x['instance_id']).to.equal(0);
    expect(x['resource_id']).to.equal(0);
    expect(x['meta']['id']).not.to.be.null;
    expect(x['meta']['meta']).not.to.be.null;
  });
}
