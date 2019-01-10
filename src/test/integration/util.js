const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const MongoClient = require('mongodb').MongoClient;

exports.getMongo = async () => {
  const uri = (process.env.NOD_ENV === 'docker') ? 'mongodb://mongo:27017' : 'mongodb://localhost:27017';

  return await MongoClient.connect(uri);
};

exports.clearDataBase = async (db) => {
  const collections = await db.collections();
  const deletePromises = collections.map((c) =>
    db.collection(c.s.name).deleteMany({}));

  return await Promise.all(deletePromises);
};

const mqtt = require('async-mqtt');
let mqttClient;

exports.getMQTT = async () => {
  const uri = (process.env.NOD_ENV === 'docker') ? 'mqtt://mqtt:1883' : 'mqtt://localhost:1883';
  mqttClient = mqtt.connect(uri);

  return new Promise((resolve, reject) => {
    mqttClient.on('connect', () => resolve(mqttClient));

    setTimeout(() => reject('Could not connect to MQTT-Broker.'), 5000);
  });
};

const Hapi = require('hapi');
const Boom = require('boom');
const hapiPort = 3001;
const hapiServer = new Hapi.Server({
  'host': '0.0.0.0',
  'port': hapiPort,
});

exports.getHapi = async () => {
  if (!hapiServer.info.started) await hapiServer.start();

  return hapiServer;
};

exports.stop = async () => {
  await hapiServer.stop();
};

exports.errorRenderer = Boom;

exports.sendRequest = async (request) => {
  response = await hapiServer.inject(request);

  try {
    payload = JSON.parse(response.payload);
  } catch (e) {
  }

  return {
    'raw': response,
    'payload': payload,
  };
};

exports.shouldReturnStatusCode = (statusCode) => {
  expect(response.statusCode).to.equal(statusCode);
};

exports.requestStub = () => ({
  'post': async () => {},
});
