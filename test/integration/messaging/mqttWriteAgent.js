const chai = require('chai');
const expect = chai.expect;
const stubs = require('../../stubs/cblocks');
const util = require('../util.js');
const wire = require('../../../wire');
const sinon = require('sinon');

let registry;
let agent;
let mqttClient;

describe('MQTT Write Agent', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('test');

    const app = wire(mongoClient, mqttClient, db, hapiServer, util.requestStub);
    registry = app.dataProviders.registry;
    agent = app.messaging.inbound.mqttWriteAgent;
    writer = app.messaging.outbound.mqttWriter;
    writer.writeTimeoutMS = 50;
  });

  beforeEach(async () => {
    sinon.spy(mqttClient, 'publish');
    await util.clearDataBase(db);
    response = {};
    payload = {};
  });

  afterEach(() => {
    mqttClient.publish.restore();
  });

  after(async () => {
    await util.stop();
  });

  it('should publish an internal command and do nothing if sensor responds',
    async () => {
      await givenLEDCBlock();
      await givenAgent();

      const p = whenPublishCommandLEDOn();
      whenLEDRespondsWithOkay();
      await p;

      shouldPublishInternalCommand();
      shouldNotPublishAnError();
    });

  it('should publish an internal command and respond with timeout if sensor does not answer',
    async () => {
      await givenLEDCBlock();
      await givenAgent();

      await whenPublishCommandLEDOn();

      shouldPublishInternalCommand();
      shouldPublishErrorWithMessage('Timeout.');
    });

  it('should publish error if invalid command', async () => {
    await givenLEDCBlock();
    await givenAgent();

    await whenPublishInvalidCommand();

    shouldPublishErrorWithMessage('instance is not of a type(s) boolean');
  });

  it('should publish error if resource not found', async () => {
    await givenLEDCBlock();
    await givenAgent();

    await whenPublishNoneExistingResource();

    shouldPublishErrorWithMessage('Resource not found.');
  });
});

async function givenLEDCBlock() {
  await registry.updateObject(stubs.led);
}

async function givenAgent() {
  await agent.start();
}

async function whenPublishCommandLEDOn() {
  await agent._onMessage('testClient/3304/0/0/input', JSON.stringify({
    'requestID': 4711,
    'data': true,
  }));
}

function whenLEDRespondsWithOkay() {
  writer._onMessage('testClient/responses', JSON.stringify({
    'requestID': 4711,
    'message': '',
  }));
}

function shouldPublishInternalCommand() {
  expect(mqttClient.publish.calledWith(
    'internal/testClient/3304/0/0/input', JSON.stringify({
    'requestID': 4711,
    'data': true,
    })
  )).to.be.true;
}

function shouldNotPublishAnError() {
  expect(mqttClient.publish.calledWith(
    'testClient/responses', JSON.stringify({
      'requestID': 4711,
      'success': false,
      'message': '',
    }))).to.be.false;
}

function shouldPublishErrorWithMessage(m) {
  expect(mqttClient.publish.calledWith(
    'testClient/responses', JSON.stringify({
      'requestID': 4711,
      'success': false,
      'message': m,
    }))).to.be.true;
}

async function whenPublishInvalidCommand() {
  await agent._onMessage('testClient/3304/0/0/input', JSON.stringify({
    'requestID': 4711,
    'data': 99,
  }));
};

async function whenPublishNoneExistingResource() {
  await agent._onMessage('testClient/3304/0/5/input', JSON.stringify({
    'requestID': 4711,
    'data': 99,
  }));
}
