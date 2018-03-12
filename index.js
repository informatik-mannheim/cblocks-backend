let co = require('co')

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

let MongoClient = require('mongodb').MongoClient;

co(function* (){
  let mongoClient = yield MongoClient.connect(mongoConfig.url)
  let db = mongoClient.db(mongoConfig.db)

  console.log("Connected to mongo.")

  return new Promise((resolve, reject) => {
    console.log("Connected to MQTT.");

    mqttClient.on('connect', function(){
      let MQTTPublishAgent = require('./messaging/agent/mqttPublishAgent.js')
      let MQTTPublisher = require('./messaging/publisher/mqttPublisher.js')

      let MQTTWriteAgent = require('./messaging/agent/mqttWriteAgent.js')
      let MQTTWriter = require('./messaging/writer/mqttWriter.js')

      let MQTTUtil = require('./messaging/util/mqttUtil.js')
      let Validator = require('jsonschema').Validator;
      let Registry = require('./registry/registry.js');

      let ResourcePublisherUseCase = require('./use-cases/resource-publisher/resourcePublisherUseCase.js')
      let ResourceWriteUseCase = require('./use-cases/resource-write/resourceWriteUseCase.js')

      let mqttPublisher = new MQTTPublisher(mqttClient, MQTTUtil)
      let mqttWriter = new MQTTWriter(mqttClient, MQTTUtil, WRITE_TIMEOUT_MS)

      let validator = new Validator();
      let registry = new Registry(db.collection('registry'), validator);

      let resourcePublisherUseCase = new ResourcePublisherUseCase(registry, mqttPublisher)
      let resourceWriteUseCase = new ResourceWriteUseCase(registry, mqttWriter)

      let mqttPublishAgent = new MQTTPublishAgent(mqttClient, MQTTUtil, resourcePublisherUseCase)
      let mqttWriteAgent = new MQTTWriteAgent(mqttClient, MQTTUtil, resourceWriteUseCase)

      mqttPublishAgent.start();
      console.log('MQTT Publish Agent started.')
      mqttWriteAgent.start()
      console.log('MQTT Write Agent started.')

      resolve()
    })
  })
}).catch(function(err){
  console.log(err);
})
