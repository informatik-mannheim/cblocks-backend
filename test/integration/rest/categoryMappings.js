const chai = require('chai');
const expect = chai.expect;
const cblockStubs = require('../../stubs/cblocks');
const mappingStubs = require('../../stubs/categoryMappings');
const util = require('../util.js');
const ObjectID = require('mongodb').ObjectID;

const mappingsCollection = 'category-mappings';
const registryCollection = 'registry';

let hapiServer;
let registry;
let dataProvider;
let db;
let response;
let payload;

const getMappingsRequestDefaults = {
  'method': 'GET',
  'url': '/mappings/category',
  'payload': {},
};

const postMappingRequestDefaults = {
  'method': 'POST',
  'url': '/mappings/category',
  'payload': {},
};

const putMappingRequestDefaults = {
  'method': 'PUT',
  'url': '/mappings/category',
  'payload': {},
};

const wire = () => {
  const JsonValidator = require('jsonschema').Validator;
  const Validator = require('../../../core/validator.js');
  const schema = require(
    '../../../controller/schema/putCategoryMappingSchema.js');
  const validator = new Validator(
    JsonValidator, schema);

  const Registry = require('../../../data-provider/registry.js');
  registry = new Registry(
    db.collection('registry'), new JsonValidator());

  const DataProvider = require(
    '../../../data-provider/mappingsDataProvider.js');
  dataProvider = new DataProvider(db.collection(mappingsCollection));

  const UseCase = require(
    '../../../use-cases/mappings/categoryMappingsUseCase.js');
  const useCase = new UseCase(dataProvider, registry);

  const Controller = require('../../../controller/mappingsController.js');
  const controller = new Controller(
    useCase, util.errorRenderer, validator);

  const Routes = require('../../../controller/categoryMappingsRoutes.js');
  const routes = new Routes(hapiServer, controller);

  routes.start();
};

describe('REST Category Mappings', () => {
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

  describe('GET category mappings', () => {
    it('should return category mappings',
      getCategoryMappingsShouldReturnCategoryMappings);

    it('should return empty array if not found',
      getCategoryMappingsShouldReturnEmptyArrayIfNotFound);
  });

  describe('GET category mappings', () => {
    it('should return mapping if found',
      getCategoryMappingShouldReturnIfFound);

    it('should return 404 if not found',
      getCategoryMappingShouldReturn404IfNotFound);
  });

  describe('POST category mapping', () => {
    it('should return mapping with id',
      postCategoryMappingShouldReturnMappingWithID);

    it('should fail with 404 if cblock not found',
      postCategoryMappingShouldRespond404IfCBlockDoesNotExist);

    it('should fail with 404 if instance not found',
      postCategoryMappingShouldRespond404IfInstanceNotFound);

    it('should fail with 400 if missing data',
      postCategoryMappingShouldFailWith400IfMissingData);
  });

  describe('PUT category mapping', () => {
    it('should return updated version',
      putCategoryMappingShouldReturnUpdatedVersion);

    it('should fail with 404 if cblock not found',
      putCategoryMappingShouldRespond404IfCBlockDoesNotExist);

    it('should fail with 400 if missing data',
      putCategoryMappingShouldFailWith400IfMissingData);
  });
});

async function getCategoryMappingsShouldReturnCategoryMappings() {
  await givenMappings();

  await whenGetMappings();

  shouldReturnMappings();
}

async function givenMappings() {
  await Promise.all([
    dataProvider.createMapping(mappingStubs.humidityCategoryMapping),
    dataProvider.createMapping(mappingStubs.temperatureCategoryMapping),
  ]);
}

async function whenGetMappings() {
  response = await hapiServer.inject(getMappingsRequestDefaults);
  payload = JSON.parse(response.payload);
}

function shouldReturnMappings() {
  expect(payload.length).to.equal(2);
}

async function getCategoryMappingsShouldReturnEmptyArrayIfNotFound() {
  await whenGetMappings();

  shouldReturnEmptyArray();
}

function shouldReturnEmptyArray() {
  expect(payload.length).to.equal(0);
}

async function getCategoryMappingShouldReturnIfFound() {
  await givenMappings();

  await whenGetMapping();

  shouldReturnMapping();
}

async function whenGetMapping() {
  const mappings = await dataProvider.getMappings();
  const id = mappings[0]['mappingID'];

  const request = {
    ...getMappingsRequestDefaults,
    'url': `/mappings/category/${id}`,
  };

  response = await hapiServer.inject(request);
  payload = JSON.parse(response.payload);
}

function shouldReturnMapping() {
  expect(payload).to.include.all.keys('mappingID', 'label');
}

async function getCategoryMappingShouldReturn404IfNotFound() {
  await whenGetNonExistingMapping();

  shouldReturn(404);
}

async function whenGetNonExistingMapping() {
  const id = new ObjectID();
  const request = {
    ...getMappingsRequestDefaults,
    'url': `/mappings/category/${id}`,
  };

  response = await hapiServer.inject(request);
  payload = JSON.parse(response.payload);
}

function shouldReturn(statusCode) {
  expect(response.result.statusCode).to.equal(statusCode);
}

async function postCategoryMappingShouldReturnMappingWithID() {
  await givenTemperatureCBlock();

  await whenPostCategoryMapping();

  shouldReturnCategoryMappingWithID();
}

async function givenTemperatureCBlock() {
  await registry.updateObject(cblockStubs.temperature);
}

async function whenPostCategoryMapping() {
  let stub = {...mappingStubs.temperatureCategoryMapping};
  delete stub.mappingID;
  delete stub._id;

  const request = {
    ...postMappingRequestDefaults,
    'payload': stub,
  };

  response = await hapiServer.inject(request);
  payload = JSON.parse(response.payload);
}

function shouldReturnCategoryMappingWithID() {
  expect(payload).to.include.all.keys('mappingID');
}

async function postCategoryMappingShouldRespond404IfCBlockDoesNotExist() {
  await whenPostCategoryMapping();

  shouldReturn(404);
}

async function postCategoryMappingShouldRespond404IfInstanceNotFound() {
  await givenTemperatureCBlock();

  await whenPostCategoryMappingNonExistingInstance();

  shouldReturn(404);
}

async function whenPostCategoryMappingNonExistingInstance() {
  let stub = {
    ...mappingStubs.temperatureCategoryMapping,
    instanceID: 99,
  };
  delete stub.mappingID;
  delete stub._id;

  const request = {
    ...postMappingRequestDefaults,
    'payload': stub,
  };

  response = await hapiServer.inject(request);
  payload = JSON.parse(response.payload);
}

async function postCategoryMappingShouldFailWith400IfMissingData() {
  await whenPostCategoryMappingWithoutLabel();

  shouldReturn(400);
}

async function postCategoryMappingShouldFailWith400IfMissingData() {
  let stub = {
    ...mappingStubs.temperatureCategoryMapping,
  };
  delete stub.mappingID;
  delete stub.label;

  const request = {
    ...postMappingRequestDefaults,
    'payload': stub,
  };

  response = await hapiServer.inject(request);
  payload = JSON.parse(response.payload);
}

async function putCategoryMappingShouldReturnUpdatedVersion() {
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
    'url': `/mappings/category/${id}`,
    'payload': stub,
  };

  response = await hapiServer.inject(request);
  payload = JSON.parse(response.payload);
}

function shouldReturnUpdatedVersion() {
  expect(payload.label).to.equal('New Label');
}

async function putCategoryMappingShouldRespond404IfCBlockDoesNotExist() {
  await givenMappings();

  await whenPutTemperatureMapping();

  shouldReturn(404);
}

async function putCategoryMappingShouldFailWith400IfMissingData() {
  await givenTemperatureCBlock();
  await givenMappings();

  await whenPutTemperatureMappingWithoutLabel();

  shouldReturn(400);
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
    'url': `/mappings/category/${id}`,
    'payload': stub,
  };

  response = await hapiServer.inject(request);
  payload = JSON.parse(response.payload);
}
