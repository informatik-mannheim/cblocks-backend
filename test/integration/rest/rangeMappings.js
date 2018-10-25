const chai = require('chai');
const expect = chai.expect;
const cblockStubs = require('../../stubs/cblocks');
const mappingStubs = require('../../stubs/rangeMappings');
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
  'url': '/mappings/range',
  'payload': {},
};

const postMappingRequestDefaults = {
  'method': 'POST',
  'url': '/mappings/range',
  'payload': {},
};

const deleteMappingRequestDefaults = {
  'method': 'DELETE',
  'url': '/mappings/range',
  'payload': {},
};

describe('REST range mappings', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    const mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, util.requestStub);
    registry = app.dataProviders.registry;
    dataProvider = app.dataProviders.rangeMappingsDataProvider;
    app.rest.inbound.rangeMappingsRoutes.start();
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
      deleteMappingShouldReturn404IfNotFound);
  });
});

async function getMappingsShouldReturnMappings() {
  await givenMappings();

  await whenGetMappings();

  util.shouldReturnStatusCode(200);
  shouldReturnMappings();
}

async function givenMappings() {
  await Promise.all([
    dataProvider.createMapping(mappingStubs.temperatureRangeMapping),
  ]);
}

async function whenGetMappings() {
  response = await util.sendRequest(getMappingsRequestDefaults);
}

function shouldReturnMappings() {
  expect(response.payload.length).to.equal(1);
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
    'url': `/mappings/range/${id}`,
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
    'url': `/mappings/range/${id}`,
  };

  response = await util.sendRequest(request);
}

async function postMappingShouldReturnMappingWithID() {
  await givenTemperatureCBlock();

  await whenPostMapping();

  util.shouldReturnStatusCode(200);
  shouldReturnMappingWithID();
}

async function givenTemperatureCBlock() {
  await registry.updateObject(cblockStubs.temperature);
}

async function whenPostMapping() {
  let stub = {...mappingStubs.temperatureRangeMapping};
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
  await givenTemperatureCBlock();

  await whenPostMappingNonExistingInstance();

  util.shouldReturnStatusCode(404);
}

async function whenPostMappingNonExistingInstance() {
  let stub = {
    ...mappingStubs.temperatureRangeMapping,
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
    ...mappingStubs.temperatureRangeMapping,
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
  await givenTemperatureCBlock();
  await givenMappings();

  await whenPostExistingTemperatureMapping();

  util.shouldReturnStatusCode(200);
  shouldReturnUpdatedVersion();
}

async function whenPostExistingTemperatureMapping() {
  const mappings = (await dataProvider.getMappings()).filter(
    (m) => m.objectID === 3303);
  const id = mappings[0]['mappingID'];
  let stub = {
    ...mappings[0],
    label: 'New Label',
  };
  delete stub.mappingID;

  const request = {
    ...postMappingRequestDefaults,
    'url': `/mappings/range/${id}`,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

function shouldReturnUpdatedVersion() {
  expect(response.payload.label).to.equal('New Label');
}

async function deleteMappingShouldReturn204() {
  await givenMappings();

  await whenDeleteTemperatureMapping();

  util.shouldReturnStatusCode(204);
}

async function whenDeleteTemperatureMapping() {
  const mappings = (await dataProvider.getMappings()).filter(
    (m) => m.objectID === 3303);
  const id = mappings[0]['mappingID'];

  const request = {
    ...deleteMappingRequestDefaults,
    'url': `/mappings/range/${id}`,
  };

  response = await util.sendRequest(request);
}

async function deleteMappingShouldReturn404IfNotFound() {
  await whenDeleteNoneExistingMapping();

  util.shouldReturnStatusCode(404);
}

async function whenDeleteNoneExistingMapping() {
  const id = new ObjectID();

  const request = {
    ...deleteMappingRequestDefaults,
    'url': `/mappings/range/${id}`,
  };

  response = await util.sendRequest(request);
}
