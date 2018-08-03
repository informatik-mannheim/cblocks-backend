const config = require('config');
const mqttConfig = config.get('mqtt');
const mongoConfig = config.get('mongo');
const hapiConfig = config.get('hapi');

const mqtt = require('mqtt');
const Hapi = require('hapi');

const wiring = require('./wiring');

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
  console.log(getMQTTConfig());
  const client = mqtt.connect(getMQTTConfig());

  return new Promise((resolve, reject) => {
    client.on('connect', () => resolve(client));

    setTimeout(() => reject('Could not connect to MQTT-Broker.'), 5000);
  });
};

const MongoClient = require('mongodb').MongoClient;

const wire = (mongoClient, mqttClient, db, hapiServer) => {
  const core = wiring.core();
  const dataProviders = wiring.dataProviders(db);

  let messaging = {};
  messaging.outbound = wiring.messaging.outbound(mqttClient);

  const useCases = wiring.useCases(
    messaging.outbound,
    dataProviders,
    core
  );

  const rest = wiring.rest(
    hapiServer,
    useCases
  );

  messaging.inbound = wiring.messaging.inbound(
    mqttClient,
    useCases
  );

  messaging.inbound.mqttWriteAgent.start();
  messaging.inbound.mqttCategoryMappingAgent.start();
  messaging.inbound.mqttRangeMappingAgent.start();

  rest.cblocksRoutes.start();
  rest.categoryMappingsRoutes.start();
  rest.rangeMappingsRoutes.start();

  console.log('Application bootstrapped.');
};

const init = async () => {
  try {
    const mongoClient = await MongoClient.connect(mongoConfig.url);
    const db = mongoClient.db(mongoConfig.db);
    console.log('Connected to mongo.');

    const mqttClient = await initMQTT();
    console.log('Connected to MQTT.');

    await hapiServer.start();
    console.log(`REST Server running at: ${hapiServer.info.uri}`);

    wire(mongoClient, mqttClient, db, hapiServer);
  } catch (e) {
    console.log(e);
  }
};

init();
