const config = require('config');
const mqttConfig = config.get('mqtt');
const mongoConfig = config.get('mongo');
const hapiConfig = config.get('hapi');
const iftttConfig = config.get('ifttt');

const mqtt = require('async-mqtt');
const Hapi = require('hapi');
const request = require('request-promise-native');

const wire = require('./wire');

const hapiServer = Hapi.server({
    port: hapiConfig.port,
    host: hapiConfig.host,
    routes: {
      cors: Object.assign({}, hapiConfig.cors) || false,
    },
});

const initMQTT = () => {
  const client = mqtt.connect(mqttConfig.uri, mqttConfig.options || {});

  return new Promise((resolve, reject) => {
    client.on('connect', () => resolve(client));

    setTimeout(() => reject('Could not connect to MQTT-Broker.'), 5000);
  });
};

const MongoClient = require('mongodb').MongoClient;

const init = async () => {
  try {
    const mongoClient = await MongoClient.connect(mongoConfig.url);
    const db = mongoClient.db(mongoConfig.db);
    console.log('Connected to mongo.');

    const mqttClient = await initMQTT();
    console.log('Connected to MQTT.');

    await hapiServer.start();
    console.log(`REST Server running at: ${hapiServer.info.uri}`);

    const app = wire(mongoClient, mqttClient, db, hapiServer, request, iftttConfig);

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

    console.log('Application bootstrapped.');
  } catch (e) {
    console.log(e);
  }
};

init();
