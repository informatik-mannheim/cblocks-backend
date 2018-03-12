const config = require('config');
const mqttConfig = config.get('mqtt');
const mongoConfig = config.get('mongo');
const writeConfig = config.get('write');

const WRITE_TIMEOUT_MS = writeConfig.timeout_ms;

const mqtt = require('mqtt');

const mqttClient = mqtt.connect({
  'host': mqttConfig.host,
  'username': mqttConfig.username,
  'password': mqttConfig.password
});

const mqttConnected = () => {
  return new Promise((resolve, reject) => {
    mqttClient.on('connect', () => resolve());

    setTimeout(() => reject('Could not connect to MQTT-Broker.'), 5000);
  });
};

const MongoClient = require('mongodb').MongoClient;

const wire = (mongoClient, db) => {
  const MQTTWriteAgent = require('./messaging/agent/mqttWriteAgent.js');
  const MQTTWriter = require('./messaging/writer/mqttWriter.js');

  const MQTTUtil = require('./messaging/util/mqttUtil.js');
  const Validator = require('jsonschema').Validator;
  const Registry = require('./registry/registry.js');

  const ResourceWriteUseCase = require('./use-cases/resource-write/resourceWriteUseCase.js');

  const mqttWriter = new MQTTWriter(mqttClient, MQTTUtil, WRITE_TIMEOUT_MS);

  const validator = new Validator();
  const registry = new Registry(db.collection('registry'), validator);

  const resourceWriteUseCase = new ResourceWriteUseCase(registry, mqttWriter);

  const mqttWriteAgent = new MQTTWriteAgent(mqttClient, MQTTUtil, resourceWriteUseCase);

  mqttWriteAgent.start();
  console.log('MQTT Write Agent started.');
};

const init = async () => {
  const mongoClient = await MongoClient.connect(mongoConfig.url);
  const db = mongoClient.db(mongoConfig.db);

  console.log('Connected to mongo.');

  await mqttConnected();
  console.log('Connected to MQTT.');

  wire(mongoClient, db);
};

init().catch(err => console.log(err));
