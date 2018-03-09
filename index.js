let co = require('co')

let config = require('config')
let mqttConfig = config.get('mqtt')
let mongoConfig = config.get('mongo')

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
      let MQTTAgent = require('./messaging/agent/mqttAgent.js')
      let MQTTPublisher = require('./messaging/publisher/mqttPublisher.js')
      let MQTTUtil = require('./messaging/util/mqttUtil.js')
      let Validator = require('jsonschema').Validator;
      let Registry = require('./registry/registry.js');
      let ResourcePublisherUseCase = require('./use-cases/resource-publisher/resourcePublisherUseCase.js')

      let mqttPublisher = new MQTTPublisher(mqttClient, MQTTUtil)
      let validator = new Validator();
      let registry = new Registry(db.collection('registry'), validator);
      let resourcePublisherUseCase = new ResourcePublisherUseCase(registry, mqttPublisher)
      let mqttAgent = new MQTTAgent(mqttClient, MQTTUtil, resourcePublisherUseCase)

      mqttAgent.start();
      console.log('MQTT Agent started.')

      resolve()
    })
  })
}).catch(function(err){
  console.log(err);
})
