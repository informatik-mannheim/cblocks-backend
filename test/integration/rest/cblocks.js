const chai = require('chai');
const expect = chai.expect;
const stubs = require('../../stubs/cblocks');
const util = require('../util.js');

let hapiServer;
let dataProvider;
let db;
let response;

const getCBlocksRequestDefaults = {
  'method': 'GET',
  'url': '/cblocks',
  'payload': {},
};

const wire = () => {
  const JsonValidator = require('jsonschema').Validator;
  const Registry = require('../../../data-provider/registry.js');
  dataProvider = new Registry(
    db.collection('registry'), new JsonValidator());

  const CBlockUseCase = require('../../../use-cases/registry/cblockUseCase.js');
  const useCase = new CBlockUseCase(dataProvider);

  const CBlockController = require('../../../controller/cblockController.js');
  const controller = new CBlockController(
    hapiServer, useCase, util.errorRenderer);

  controller.start();
};

describe('REST cBlocks', () => {
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
  response = await util.sendRequest(getCBlocksRequestDefaults);
}

function shouldReturnTwoCBlocks() {
  expect(response.payload.length).to.equal(2);
}

async function getCBlocksShouldReturnEmptyArrayIfThereAreNone() {
  await whenGetAllCBlocks();

  shouldReturnEmptyArray();
}

function shouldReturnEmptyArray() {
  expect(response.payload.length).to.equal(0);
}

async function getTemperatureCBlocksShouldReturnItIfExists() {
  await givenTwoCBlocks();

  await whenGetTemperatureCBlock();

  shouldReturnTemperatureCBlock();
}

async function whenGetTemperatureCBlock() {
  const request = {
    ...getCBlocksRequestDefaults,
    'url': '/cblocks/3303',
  };

  response = await util.sendRequest(request);
}

function shouldReturnTemperatureCBlock() {
  expect(response.payload.objectID).to.equal(3303);
}

async function getTemperatureCBlocksShouldReturn404IfNotFound() {
  await whenGetTemperatureCBlock();

  util.shouldReturnStatusCode(404);
}
