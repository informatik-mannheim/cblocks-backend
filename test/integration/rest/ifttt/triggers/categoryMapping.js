const chai = require('chai');
const expect = chai.expect;
const ObjectID = require('mongodb').ObjectID;
const util = require('../../../util.js');
const wire = require('../../../../../wire');
const config = require('config');
const iftttConfig = config.get('ifttt');

let hapiServer;
let db;
let response;

const postMappingDefaults = {
  'method': 'POST',
  'url': '/ifttt/v1/triggers/new_category_mappings',
  'payload': {
    'trigger_identity': '737ea7ac0bf6b45236002b72e7a6e99a5bf1c1d8',
    'triggerFields': {
      'mapping_id': '4711',
      'to': 'hot',
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

const deleteMappingDefaults = {
  'method': 'DELETE',
  'url': '/ifttt/v1/triggers/new_category_mappings/trigger_identity/737ea7ac0bf6b45236002b72e7a6e99a5bf1c1d8',
  'headers': {
    'ifttt-service-key': iftttConfig['service-key'],
    'ifttt-channel-key': iftttConfig['service-key'],
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'Accept-Encoding': 'gzip, deflate',
  },
};

describe('REST IFTTT Category Mapping Trigger', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    const mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, util.requestStub, iftttConfig);

    dataProvider = app.dataProviders.categoryMappingsOutputDataProvider;
    triggersDataProvider = app.dataProviders.triggersDataProvider;
    app.rest.inbound.ifttt.triggers.categoryMappingsRoutes.start();
    app.rest.inbound.ifttt.triggers.triggersRoutes.start();
  });

  beforeEach(async () => {
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  after(async () => {
    await util.stop();
  });

  describe('POST /ifttt/v1/triggers/new_category_mappings', () => {
    it('should return latest mappings', async () => {
      const mappingID = new ObjectID();

      const records = [{
        mappingID,
        from: 33,
        to: 'hot',
      }, {
        mappingID,
        from: 25,
        to: 'medium',
      },
      {
        mappingID,
        from: 34,
        to: 'hot',
      }];

      await givenRecords(records);

      const request = {...postMappingDefaults};
      request.payload.triggerFields.mapping_id = mappingID;

      await whenRequest(request);

      statusCodeShouldBe(200);
      shouldReturnRecords(mappingID, 2);
    });

    it('should return 1 if limit is 1', async () => {
      const mappingID = new ObjectID();

      const records = [{
        mappingID,
        from: 33,
        to: 'hot',
      }, {
        mappingID,
        from: 25,
        to: 'medium',
      },
      {
        mappingID,
        from: 34,
        to: 'hot',
      }];

      await givenRecords(records);

      const request = {...postMappingDefaults};
      request.payload.triggerFields.mapping_id = mappingID;
      request.payload.limit = 1;

      await whenRequest(request);

      statusCodeShouldBe(200);
      shouldReturnRecords(mappingID, 1);
    });

    it('should save trigger identity to database', async () => {
      await whenRequest(postMappingDefaults);

      await shouldHaveTriggerIdentites(
        'new_category_mappings',
        ['737ea7ac0bf6b45236002b72e7a6e99a5bf1c1d8']
      );
    });

    it('should only save one trigger identity for same requests', async () => {
      await whenRequest(postMappingDefaults);
      await whenRequest(postMappingDefaults);

      await shouldHaveTriggerIdentites(
        'new_category_mappings',
        ['737ea7ac0bf6b45236002b72e7a6e99a5bf1c1d8']
      );

      await nummberOfTriggerIdentiesShouldBe('new_category_mappings', 1);
    });
  });

  describe('DELETE /ifttt/v1/triggers/new_category_mappings/trigger_identity/{id}', () => {
    it('should delete existing', async () => {
      await whenRequest(postMappingDefaults);

      await nummberOfTriggerIdentiesShouldBe('new_category_mappings', 1);

      await whenRequest(deleteMappingDefaults);

      await nummberOfTriggerIdentiesShouldBe('new_category_mappings', 0);
    });
  });
});

async function givenRecords(records) {
  records.forEach(async ({mappingID, from, to, timestamp = Date.now()}) => {
    await dataProvider.record(mappingID, from, to, timestamp);
  });
}

async function whenRequest(r) {
  response = await util.sendRequest(r);
}

function statusCodeShouldBe(code) {
  expect(response.raw.statusCode).to.equal(code);
}

function shouldReturnRecords(mappingID, numberOfRecords) {
  expect(response.payload.data.length).to.equal(numberOfRecords);

  response.payload.data.forEach((x) => {
    expect(x['mapping_id']).to.equal(mappingID.toHexString());
    expect(x['to']).not.to.be.null;
    expect(x['from']).not.to.be.null;
    expect(x['created_at']).not.to.be.null;
    expect(x['meta']['id']).not.to.be.null;
    expect(x['meta']['meta']).not.to.be.null;
  });
}

async function shouldHaveTriggerIdentites(triggerName, triggerIdentities) {
  const data = await triggersDataProvider.getTriggerIdentities(triggerName);
  const triggerIdentitiesDb = data.map((x) => x.triggerIdentity);

  triggerIdentities.forEach(
    (v) => expect(triggerIdentitiesDb.includes(v)).to.be.true
  );
}

async function nummberOfTriggerIdentiesShouldBe(triggerName, number) {
  const data = await triggersDataProvider.getTriggerIdentities(triggerName);

  expect(data.length).to.equal(number);
}
