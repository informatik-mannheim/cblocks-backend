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
  const CBlockController = require('./controller/cblockController.js');
  const MappingsController = require('./controller/mappingsController.js');
  const MQTTWriteAgent = require('./messaging/agent/mqttWriteAgent.js');
  const MQTTWriter = require('./messaging/writer/mqttWriter.js');

  const MQTTUtil = require('./messaging/util/mqttUtil.js');
  const JsonValidator = require('jsonschema').Validator;
  const Registry = require('./data-provider/registry.js');
  const Validator = require('./core/validator.js');
  const MappingsDataProvider = require(
    './data-provider/mappingsDataProvider.js');

  const ResourceWriteUseCase =
   require('./use-cases/resource-write/resourceWriteUseCase.js');
  const CBlockUseCase = require('./use-cases/registry/cblockUseCase.js');
  const MappingsUseCase = require('./use-cases/mappings/mappingsUseCase.js');

  const mqttWriter = new MQTTWriter(mqttClient, MQTTUtil, WRITE_TIMEOUT_MS);

  const putCategoryMappingSchema = require(
    './controller/schema/putCategoryMappingSchema.js');
  const putCategoryMappingValidator = new Validator(
    JsonValidator, putCategoryMappingSchema);
  const registry = new Registry(db.collection('registry'), new JsonValidator());
  const mappingsDataProvider = new MappingsDataProvider(
    db.collection('category-mappings'));

  const resourceWriteUseCase = new ResourceWriteUseCase(registry, mqttWriter);
  const cBlockUseCase = new CBlockUseCase(registry);
  const mappingsUseCase = new MappingsUseCase(mappingsDataProvider);

  const mqttWriteAgent = new MQTTWriteAgent(
    mqttClient, MQTTUtil, resourceWriteUseCase);
  const cBlockController = new CBlockController(
    hapiServer, cBlockUseCase, Boom);
  const mappingsController = new MappingsController(
    hapiServer, mappingsUseCase, Boom, putCategoryMappingValidator
  );

  mqttWriteAgent.start();
  cBlockController.start();
  mappingsController.start();

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
