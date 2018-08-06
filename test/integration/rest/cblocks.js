const chai = require('chai');
const expect = chai.expect;
const stubs = require('../../stubs/cblocks');
const util = require('../util.js');
const wire = require('../../../wire');

let hapiServer;
let dataProvider;
let db;
let response;

const getCBlocksRequestDefaults = {
  'method': 'GET',
  'url': '/cblocks',
  'payload': {},
};

describe('REST cBlocks', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    const mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer);
    dataProvider = app.dataProviders.registry;
    app.rest.cblocksRoutes.start();
  });

  beforeEach(async () => {
    await util.clearDataBase(db);
    response = {};
    payload = {};
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

  util.shouldReturnStatusCode(200);
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

  util.shouldReturnStatusCode(200);
  shouldReturnEmptyArray();
}

function shouldReturnEmptyArray() {
  expect(response.payload.length).to.equal(0);
}

async function getTemperatureCBlocksShouldReturnItIfExists() {
  await givenTwoCBlocks();

  await whenGetTemperatureCBlock();

  util.shouldReturnStatusCode(200);
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
