const config = require('config');
const mqttConfig = config.get('mqtt');
const mongoConfig = config.get('mongo');
const writeConfig = config.get('write');
const hapiConfig = config.get('hapi');

const WRITE_TIMEOUT_MS = writeConfig.timeout_ms;

const mqtt = require('mqtt');
const Hapi = require('hapi');


const hapiServer = Hapi.server({
    port: hapiConfig.port,
    host: hapiConfig.host,
});
const Boom = require('boom');

const mqttClient = mqtt.connect({
  'host': mqttConfig.host,
  'username': mqttConfig.username,
  'password': mqttConfig.password,
});

const mqttConnected = () => {
  return new Promise((resolve, reject) => {
    mqttClient.on('connect', () => resolve());

    setTimeout(() => reject('Could not connect to MQTT-Broker.'), 5000);
  });
};

const MongoClient = require('mongodb').MongoClient;

const wire = (mongoClient, db, hapiServer) => {
  const CBlockController = require('./controller/cblockController.js');
  const MQTTWriteAgent = require('./messaging/agent/mqttWriteAgent.js');
  const MQTTWriter = require('./messaging/writer/mqttWriter.js');

  const MQTTUtil = require('./messaging/util/mqttUtil.js');
  const Validator = require('jsonschema').Validator;
  const Registry = require('./data-provider/registry.js');

  const ResourceWriteUseCase =
   require('./use-cases/resource-write/resourceWriteUseCase.js');
  const CBlockUseCase = require('./use-cases/registry/cblockUseCase.js');

  const mqttWriter = new MQTTWriter(mqttClient, MQTTUtil, WRITE_TIMEOUT_MS);

  const validator = new Validator();
  const registry = new Registry(db.collection('registry'), validator);

  const resourceWriteUseCase = new ResourceWriteUseCase(registry, mqttWriter);
  const cBlockUseCase = new CBlockUseCase(registry);

  const mqttWriteAgent = new MQTTWriteAgent(
    mqttClient, MQTTUtil, resourceWriteUseCase);
  const cBlockController = new CBlockController(hapiServer, cBlockUseCase, Boom);

  mqttWriteAgent.start();
  console.log('Application bootstrapped.');
};

const init = async () => {
  try {
    const mongoClient = await MongoClient.connect(mongoConfig.url);
    const db = mongoClient.db(mongoConfig.db);
    console.log('Connected to mongo.');

    await mqttConnected();
    console.log('Connected to MQTT.');

    await hapiServer.start();
    console.log(`REST Server running at: ${hapiServer.info.uri}`);

    wire(mongoClient, db, hapiServer);
  } catch (e) {
    console.log(e);
  }
};

init();
