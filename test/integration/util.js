const chai = require('chai');
const expect = chai.expect;

const MongoClient = require('mongodb').MongoClient;

exports.getMongo = async () => {
  return await MongoClient.connect('mongodb://localhost:27017');
};

exports.clearDataBase = async (db) => {
  const collections = await db.collections();
  const deletePromises = collections.map((c) =>
    db.collection(c.s.name).deleteMany({}));

  return await Promise.all(deletePromises);
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
