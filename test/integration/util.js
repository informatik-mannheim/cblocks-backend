const chai = require('chai');
const expect = chai.expect;

const MongoInMemory = require('mongo-in-memory');
const mongoPort = 8000;
const mongoServerInstance = new MongoInMemory(mongoPort);
const MongoClient = require('mongodb').MongoClient;
const startMongo = () => {
  return new Promise((resolve, reject) => {
    mongoServerInstance.start((error, config) => {
      if (error) reject(error);

      resolve();
    });
  });
};

exports.getMongo = async () => {
  await startMongo();
  return await MongoClient.connect(mongoServerInstance.getMongouri('test'));
};

exports.stopMongo = () => {
  return new Promise((resolve, reject) => {
    mongoServerInstance.stop((error) => {
      if (error) reject(error);

      resolve();
    });
  });
};

const mqtt = require('mqtt');
let mqttClient;

exports.getMQTT = async () => {
  mqttClient = mqtt.connect('mqtt://localhost:1883');

  return new Promise((resolve, reject) => {
    mqttClient.on('connect', () => resolve(mqttClient));

    setTimeout(() => reject('Could not connect to MQTT-Broker.'), 5000);
  });
};

exports.stopMQTT = () => {
  mqttClient.end();
};

const Hapi = require('hapi');
const Boom = require('boom');
const hapiPort = 8080;
const hapiServer = new Hapi.Server({
  'port': hapiPort,
});

exports.getHapi = async () => {
  if (!hapiServer.info.started) await hapiServer.start();

  return hapiServer;
};

exports.stopHapi = async () => {
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
