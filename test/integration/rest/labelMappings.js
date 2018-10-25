const chai = require('chai');
const expect = chai.expect;
const cblockStubs = require('../../stubs/cblocks');
const mappingStubs = require('../../stubs/labelMappings');
const util = require('../util.js');
const ObjectID = require('mongodb').ObjectID;
const wire = require('../../../wire');

let hapiServer;
let registry;
let dataProvider;
let db;
let response;

const getMappingsRequestDefaults = {
  'method': 'GET',
  'url': '/mappings/label',
  'payload': {},
};

const postMappingRequestDefaults = {
  'method': 'POST',
  'url': '/mappings/label',
  'payload': {},
};

const deleteMappingRequestDefaults = {
  'method': 'DELETE',
  'url': '/mappings/label',
  'payload': {},
};

describe('REST label mappings', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    const mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, util.requestStub);
    registry = app.dataProviders.registry;
    dataProvider = app.dataProviders.labelMappingsDataProvider;
    app.rest.inbound.labelMappingsRoutes.start();
  });

  beforeEach(async () => {
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  describe('GET mappings', () => {
    it('should return mappings',
      getMappingsShouldReturnMappings);

    it('should return empty array if not found',
      getMappingsShouldReturnEmptyArrayIfNotFound);
  });

  describe('GET mappings', () => {
    it('should return mapping if found',
      getMappingShouldReturnIfFound);

    it('should return 404 if not found',
      getMappingShouldReturn404IfNotFound);
  });

  describe('POST mapping', () => {
    it('should return mapping with id',
      postMappingShouldReturnMappingWithID);

    it('should fail with 404 if cblock not found',
      postMappingShouldRespond404IfCBlockDoesNotExist);

    it('should fail with 404 if instance not found',
      postMappingShouldRespond404IfInstanceNotFound);

    it('should fail with 400 if missing data',
      postMappingShouldFailWith400IfMissingData);

    it('should return updated version if ID provided',
      postMappingWithIDShouldReturnUpdatedVersion);
  });

  describe('DELETE mapping', () => {
    it('should delete mapping if it exists',
      deleteMappingShouldReturn204);

    it('should return 404 if mapping not found',
      deleteMappingshouldReturn404IfNotFound);
  });
});

async function getMappingsShouldReturnMappings() {
  await givenMappings();

  await whenGetMappings();

  util.shouldReturnStatusCode(200);
  shouldReturnMappings();
}

function givenMappings() {
  return Promise.all([
    dataProvider.createMapping(mappingStubs.buttonLabelMapping),
    dataProvider.createMapping(mappingStubs.ledLabelMapping),
  ]);
}

async function whenGetMappings() {
  response = await util.sendRequest(getMappingsRequestDefaults);
}

function shouldReturnMappings() {
  expect(response.payload.length).to.equal(2);
}

async function getMappingsShouldReturnEmptyArrayIfNotFound() {
  await whenGetMappings();

  util.shouldReturnStatusCode(200);
  shouldReturnEmptyArray();
}

function shouldReturnEmptyArray() {
  expect(response.payload.length).to.equal(0);
}

async function getMappingShouldReturnIfFound() {
  await givenMappings();

  await whenGetMapping();

  util.shouldReturnStatusCode(200);
  shouldReturnMapping();
}

async function whenGetMapping() {
  const mappings = await dataProvider.getMappings();
  const id = mappings[0]['mappingID'];

  const request = {
    ...getMappingsRequestDefaults,
    'url': `/mappings/label/${id}`,
  };

  response = await util.sendRequest(request);
}

function shouldReturnMapping() {
  expect(response.payload).to.include.all.keys('mappingID', 'label');
}

async function getMappingShouldReturn404IfNotFound() {
  await whenGetNonExistingMapping();

  util.shouldReturnStatusCode(404);
}

async function whenGetNonExistingMapping() {
  const id = new ObjectID();
  const request = {
    ...getMappingsRequestDefaults,
    'url': `/mappings/label/${id}`,
  };

  response = await util.sendRequest(request);
}

async function postMappingShouldReturnMappingWithID() {
  await givenLedCblock();

  await whenPostMapping();

  util.shouldReturnStatusCode(200);
  shouldReturnMappingWithID();
}

async function givenLedCblock() {
  await registry.updateObject(cblockStubs.led);
}

async function whenPostMapping() {
  let stub = {...mappingStubs.ledLabelMapping};
  delete stub.mappingID;
  delete stub._id;

  const request = {
    ...postMappingRequestDefaults,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

function shouldReturnMappingWithID() {
  expect(response.payload).to.include.all.keys('mappingID');
}

async function postMappingShouldRespond404IfCBlockDoesNotExist() {
  await whenPostMapping();

  util.shouldReturnStatusCode(404);
}

async function postMappingShouldRespond404IfInstanceNotFound() {
  await givenLedCblock();

  await whenPostMappingNonExistingInstance();

  util.shouldReturnStatusCode(404);
}

async function whenPostMappingNonExistingInstance() {
  let stub = {
    ...mappingStubs.ledLabelMapping,
    instanceID: 99,
  };
  delete stub.mappingID;
  delete stub._id;

  const request = {
    ...postMappingRequestDefaults,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

async function postMappingShouldFailWith400IfMissingData() {
  await whenPostMappingWithoutLabel();

  util.shouldReturnStatusCode(400);
}

async function postMappingShouldFailWith400IfMissingData() {
  let stub = {
    ...mappingStubs.ledLabelMapping,
  };
  delete stub.mappingID;
  delete stub.label;

  const request = {
    ...postMappingRequestDefaults,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

async function postMappingWithIDShouldReturnUpdatedVersion() {
  await givenLedCblock();
  await givenMappings();

  await whenPostExistingMapping();

  util.shouldReturnStatusCode(200);
  shouldReturnUpdatedVersion();
}

async function whenPostExistingMapping() {
  const mappings = (await dataProvider.getMappings()).filter(
    (m) => m.objectID === 3304);
  const id = mappings[0]['mappingID'];
  let stub = {
    ...mappings[0],
    label: 'New Label',
  };
  delete stub.mappingID;

  const request = {
    ...postMappingRequestDefaults,
    'url': `/mappings/label/${id}`,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

function shouldReturnUpdatedVersion() {
  expect(response.payload.label).to.equal('New Label');
}

async function deleteMappingShouldReturn204() {
  await givenMappings();

  await whenDeleteLedMapping();

  util.shouldReturnStatusCode(204);
}

async function whenDeleteLedMapping() {
  const mappings = (await dataProvider.getMappings()).filter(
    (m) => m.objectID === 3304);
  const id = mappings[0]['mappingID'];

  const request = {
    ...deleteMappingRequestDefaults,
    'url': `/mappings/label/${id}`,
  };

  response = await util.sendRequest(request);
}

async function deleteMappingshouldReturn404IfNotFound() {
  await whenDeleteNoneExistingMapping();

  util.shouldReturnStatusCode(404);
}

async function whenDeleteNoneExistingMapping() {
  const id = new ObjectID();

  const request = {
    ...deleteMappingRequestDefaults,
    'url': `/mappings/label/${id}`,
  };

  response = await util.sendRequest(request);
}
