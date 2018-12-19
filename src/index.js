const mqtt = require('async-mqtt');
const Hapi = require('hapi');
const request = require('request-promise-native');
const Fs = require('fs');

const config = require('./config.js');
const wire = require('./wire');

const hapiServer = Hapi.server(config.hapi);

const initMQTT = () => {
  const client = mqtt.connect(config.mqtt.url);

  return new Promise((resolve, reject) => {
    client.on('connect', () => resolve(client));

    setTimeout(() => reject('Could not connect to MQTT-Broker.'), 5000);
  });
};

const MongoClient = require('mongodb').MongoClient;

const init = async () => {
  try {
    const mongoClient = await MongoClient.connect(config.mongo.url);
    const db = mongoClient.db(config.mongo.db);
    console.log('Connected to mongo.');

    const mqttClient = await initMQTT();
    console.log('Connected to MQTT.');

    await hapiServer.start();
    console.log(`REST Server running at: ${hapiServer.info.uri}`);

    const app = wire(mongoClient, mqttClient, db, hapiServer, request, config);

    app.messaging.inbound.mqttWriteAgent.start();
    app.messaging.inbound.mqttRangeMappingAgent.start();
    app.messaging.inbound.mqttCategoryMappingAgent.start();
    app.messaging.inbound.mqttLabelMappingAgent.start();
    app.messaging.inbound.resourceOutputRecorderAgent.start();

    app.rest.inbound.cblocksRoutes.start();
    app.rest.inbound.categoryMappingsRoutes.start();
    app.rest.inbound.rangeMappingsRoutes.start();
    app.rest.inbound.labelMappingsRoutes.start();
    app.rest.inbound.ifttt.testRoutes.start();
    app.rest.inbound.ifttt.statusRoutes.start();
    app.rest.inbound.ifttt.triggers.triggersRoutes.start();
    app.rest.inbound.ifttt.triggers.newSensorDataRoutes.start();
    app.rest.inbound.ifttt.triggers.categoryMappingsRoutes.start();
    app.rest.inbound.ifttt.triggers.labelMappingsRoutes.start();

    console.log('Application bootstrapped.');
  } catch (e) {
    console.error(e);
  }
};

init();
