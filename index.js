const config = require('config');
const mqttConfig = config.get('mqtt');
const mongoConfig = config.get('mongo');
const hapiConfig = config.get('hapi');

const mqtt = require('async-mqtt');
const Hapi = require('hapi');

const wire = require('./wire');

const hapiServer = Hapi.server({
    port: hapiConfig.port,
    host: hapiConfig.host,
});

const getMQTTConfig = () => {
  let data = {
    host: mqttConfig.host,
  };

  if (mqttConfig.user !== undefined) {
    data.user = mqttConfig.user;
  }

  if (mqttConfig.password !== undefined ) {
    data.password = mqttConfig.password;
  }

  return data;
};

const initMQTT = () => {
  const client = mqtt.connect(getMQTTConfig());

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

    const app = wire(mongoClient, mqttClient, db, hapiServer);

    app.messaging.inbound.mqttWriteAgent.start();
    app.messaging.inbound.mqttRangeMappingAgent.start();
    app.messaging.inbound.mqttCategoryMappingAgent.start();
    app.messaging.inbound.mqttLabelMappingAgent.start();

    app.rest.cblocksRoutes.start();
    app.rest.categoryMappingsRoutes.start();
    app.rest.rangeMappingsRoutes.start();
    app.rest.labelMappingsRoutes.start();

    console.log('Application bootstrapped.');
  } catch (e) {
    console.log(e);
  }
};

init();
