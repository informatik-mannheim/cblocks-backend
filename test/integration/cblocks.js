const chai = require('chai');
const expect = chai.expect;
const stubs = require('../stubs/cblocks');

const MongoInMemory = require('mongo-in-memory');
const mongoPort = 8000;
const mongoServerInstance = new MongoInMemory(8000);
const mongoServerStart = () => {
  return new Promise((resolve, reject) => {
    mongoServerInstance.start((error, config) => {
      if (error) reject(error);

      resolve();
    });
  });
};
let dataProvider = {};

const MongoClient = require('mongodb').MongoClient;
const connectMongo = async () => {
  return await MongoClient.connect(mongoServerInstance.getMongouri('test'));
};
let db;

const Hapi = require('hapi');
const Boom = require('boom');
const hapiPort = 8080;
const hapiServer = new Hapi.Server({
  'port': hapiPort,
});
const startHapiServer = async () => {
  if (hapiServer.info.started) return;

  await hapiServer.start();
};
let response;
let payload;

const getCBlocksRequestDefaults = {
  'method': 'GET',
  'url': '/cblocks',
  'payload': {},
};

const wire = async () => {
  const JsonValidator = require('jsonschema').Validator;
  const Registry = require('../../data-provider/registry.js');
  dataProvider = new Registry(
    db.collection('registry'), new JsonValidator());

  const CBlockUseCase = require('../../use-cases/registry/cblockUseCase.js');
  const useCase = new CBlockUseCase(dataProvider);

  const CBlockController = require('../../controller/cblockController.js');
  const controller = new CBlockController(hapiServer, useCase, Boom);

  controller.start();
};

describe('cBlocks', () => {
  before(async () => {
    await mongoServerStart();
    const mongoClient = await connectMongo();
    db = mongoClient.db('cblocks');
    await startHapiServer();

    await wire();
  });

  beforeEach(() => {
    response = {};
    payload = {};
  });

  after(() => {
    mongoServerInstance.stop();
  });

  afterEach(() => {
    db.collection('registry').deleteMany({});
  });

  describe('GET /cblocks', () => {
    it('should get all cblocks if there are some',
      getCBlocksShouldGetAllCBlocksIfThereAreSome);

    it('should return empty array if there are none',
      getCBlocksShouldReturnEmptyArrayIfThereAreNone);
  });

  describe('GET /cblocks/{objectID}', () => {
    it('should get cblock if it exists',
      getTemperatureCBlocksShouldReturnItIfExists);

    it('should return 404 if not found',
      getTemperatureCBlocksShouldReturn404IfNotFound);
  });

  describe('PATCH label should set label of instance if exists',
    patchLabelShouldSetLabelIfExists);
});

async function getCBlocksShouldGetAllCBlocksIfThereAreSome() {
  await givenTwoCBlocks();

  await whenGetAllCBlocks();

  shouldReturnTwoCBlocks();
}

async function givenTwoCBlocks() {
  await Promise.all([
    dataProvider.updateObject(stubs.temperature),
    dataProvider.updateObject(stubs.led),
  ]);
}

async function whenGetAllCBlocks() {
  response = await hapiServer.inject(getCBlocksRequestDefaults);
  payload = JSON.parse(response.payload);
}

function shouldReturnTwoCBlocks() {
  expect(payload.length).to.equal(2);
}

async function getCBlocksShouldReturnEmptyArrayIfThereAreNone() {
  await whenGetAllCBlocks();

  shouldReturnEmptyArray();
}

function shouldReturnEmptyArray() {
  expect(payload.length).to.equal(0);
}

async function getTemperatureCBlocksShouldReturnItIfExists() {
  await givenTwoCBlocks();

  await whenGetTemperatureCBlock();

  shouldReturnTemperatureCBlock();
}

async function whenGetTemperatureCBlock() {
  const request = Object.assign({}, getCBlocksRequestDefaults, {
    'url': '/cblocks/3303',
  });

  response = await hapiServer.inject(request);
  payload = JSON.parse(response.payload);
}

function shouldReturnTemperatureCBlock() {
  expect(payload.objectID).to.equal(3303);
}

async function getTemperatureCBlocksShouldReturn404IfNotFound() {
  await whenGetTemperatureCBlock();

  shouldReturn404();
}

function shouldReturn404() {
  expect(response.result.statusCode).to.equal(404);
}

async function patchLabelShouldSetLabelIfExists() {
  await givenTwoCBlocks();

  await whenPatchLabel();

  shouldRespondWith204();
}

async function whenPatchLabel() {

}
