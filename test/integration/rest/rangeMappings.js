const chai = require('chai');
const expect = chai.expect;
const cblockStubs = require('../../stubs/cblocks');
const mappingStubs = require('../../stubs/rangeMappings');
const util = require('../util.js');
const ObjectID = require('mongodb').ObjectID;

const mappingsCollection = 'range-mappings';
const registryCollection = 'registry';

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

const putMappingRequestDefaults = {
  'method': 'PUT',
  'url': '/mappings/range',
  'payload': {},
};

const deleteMappingRequestDefaults = {
  'method': 'DELETE',
  'url': '/mappings/range',
  'payload': {},
};

const wire = () => {
  const JsonValidator = require('jsonschema').Validator;
  const Validator = require('../../../core/validator.js');
  const schema = require(
    '../../../controller/schema/putRangeMappingSchema.js');
  const validator = new Validator(
    JsonValidator, schema);

  const Registry = require('../../../data-provider/registry.js');
  registry = new Registry(
    db.collection('registry'), new JsonValidator());

  const DataProvider = require(
    '../../../data-provider/mappingsDataProvider.js');
  dataProvider = new DataProvider(db.collection(mappingsCollection));

  const rangeMap = require('../../../core/rangeMap.js');
  const UseCase = require(
    '../../../use-cases/mappings/rangeMappingsUseCase.js');
  const useCase = new UseCase(dataProvider, registry, rangeMap);

  const Controller = require('../../../controller/mappingsController.js');
  const controller = new Controller(
    useCase, util.errorRenderer, validator);

  const Routes = require('../../../controller/rangeMappingsRoutes.js');
  const routes = new Routes(hapiServer, controller);

  routes.start();
};

describe('REST mappings', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    hapiServer = await util.getHapi();
    db = mongoClient.db('cblocks');

    wire();
  });

  beforeEach(() => {
    response = {};
    payload = {};
  });

  after(async () => {
    await Promise.all([
      await util.stopMongo(),
      await util.stopHapi(),
    ]);
  });

  afterEach(() => {
    db.collection(mappingsCollection).deleteMany({});
    db.collection(registryCollection).deleteMany({});
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
  });

  describe('PUT mapping', () => {
    it('should return updated version',
      putMappingShouldReturnUpdatedVersion);

    it('should fail with 404 if cblock not found',
      putMappingShouldRespond404IfCBlockDoesNotExist);

    it('should fail with 400 if missing data',
      putMappingShouldFailWith400IfMissingData);
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

  shouldReturnEmptyArray();
}

function shouldReturnEmptyArray() {
  expect(response.payload.length).to.equal(0);
}

async function getMappingShouldReturnIfFound() {
  await givenMappings();

  await whenGetMapping();

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

async function putMappingShouldReturnUpdatedVersion() {
  await givenTemperatureCBlock();
  await givenMappings();

  await whenPutTemperatureMapping();

  shouldReturnUpdatedVersion();
}

async function whenPutTemperatureMapping() {
  const mappings = (await dataProvider.getMappings()).filter(
    (m) => m.objectID === 3303);
  const id = mappings[0]['mappingID'];
  let stub = {
    ...mappings[0],
    label: 'New Label',
  };
  delete stub.mappingID;

  const request = {
    ...putMappingRequestDefaults,
    'url': `/mappings/range/${id}`,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

function shouldReturnUpdatedVersion() {
  expect(response.payload.label).to.equal('New Label');
}

async function putMappingShouldRespond404IfCBlockDoesNotExist() {
  await givenMappings();

  await whenPutTemperatureMapping();

  util.shouldReturnStatusCode(404);
}

async function putMappingShouldFailWith400IfMissingData() {
  await givenTemperatureCBlock();
  await givenMappings();

  await whenPutTemperatureMappingWithoutLabel();

  util.shouldReturnStatusCode(400);
}

async function whenPutTemperatureMappingWithoutLabel() {
  const mappings = (await dataProvider.getMappings()).filter(
    (m) => m.objectID === 3303);
  const id = mappings[0]['mappingID'];
  let stub = {
    ...mappings[0],
  };
  delete stub._od;
  delete stub.default;

  const request = {
    ...putMappingRequestDefaults,
    'url': `/mappings/range/${id}`,
    'payload': stub,
  };

  response = await util.sendRequest(request);
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