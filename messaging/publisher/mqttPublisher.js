class MQTTPublisher{
  constructor(client, util){
    this.client = client;
    this.util = util;
  }

  publishResourceValue(objectID, instanceID, resourceID, data){
    this.client.publish(this.util.getResourceOutputTopic(objectID, instanceID, resourceID), data);
    return Promise.resolve();
  }
}

module.exports = MQTTPublisher;
