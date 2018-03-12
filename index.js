let config = require('config')
let mqttConfig = config.get('mqtt')
let mongoConfig = config.get('mongo')
let writeConfig = config.get('write')

const WRITE_TIMEOUT_MS = writeConfig['timeout_ms']

let mqtt = require('mqtt')

let mqttClient = mqtt.connect({
  'host': mqttConfig.host,
  'username': mqttConfig.username,
  'password': mqttConfig.password
})

let mqttConnected = () => {
  let p = new Promise((resolve, reject) => {
    mqttClient.on('connect', () => resolve());

    setTimeout(() => reject("Could not connect to MQTT-Broker."), 5000);
  })
}

let MongoClient = require('mongodb').MongoClient;

let init = async () => {
  let mongoClient = await MongoClient.connect(mongoConfig.url)
  let db = mongoClient.db(mongoConfig.db)

  console.log("Connected to mongo.")

  await mqttConnected();
  console.log("Connected to MQTT.");

  wire(mongoClient, db)
}

let wire = (mongoClient, db) => {
  let MQTTWriteAgent = require('./messaging/agent/mqttWriteAgent.js')
  let MQTTWriter = require('./messaging/writer/mqttWriter.js')

  let MQTTUtil = require('./messaging/util/mqttUtil.js')
  let Validator = require('jsonschema').Validator;
  let Registry = require('./registry/registry.js');

  let ResourceWriteUseCase = require('./use-cases/resource-write/resourceWriteUseCase.js')

  let mqttWriter = new MQTTWriter(mqttClient, MQTTUtil, WRITE_TIMEOUT_MS)

  let validator = new Validator();
  let registry = new Registry(db.collection('registry'), validator);

  let resourceWriteUseCase = new ResourceWriteUseCase(registry, mqttWriter)

  let mqttWriteAgent = new MQTTWriteAgent(mqttClient, MQTTUtil, resourceWriteUseCase)

  mqttWriteAgent.start()
  console.log('MQTT Write Agent started.')
}

init().catch(err => console.log(err))
