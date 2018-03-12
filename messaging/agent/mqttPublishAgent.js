class MQTTPublishAgent{
  constructor(client, util, resourcePublisherUseCase){
    this.client = client;
    this.util = util;
    this.resourcePublisherUseCase = resourcePublisherUseCase;
  }

  start() {
    this.client.subscribe(this._internalOutputs());
    this.client.on('message', this._onMessage.bind(this));
  }

  _onMessage(topic, message){
    if(!this._isOutputMessage(topic)) return

    try {
      let ipso = this.util.decomposeResourceOutputTopic(topic);
      let data = JSON.parse(message);

      this._publish(ipso, data)
    } catch (e) {
      console.log(e)
    }
  }

  _publish(ipso, data){
    this.resourcePublisherUseCase.publish(ipso.objectID, ipso.instanceID, ipso.resourceID, data)
      .catch(this._onPublishError.bind(this, ipso))
  }

  _isOutputMessage(topic){
    return topic.includes('output')
  }

  _onPublishError(ipso, err){
    this.client.publish(this.util.getPublishErrorTopic(ipso.objectID, ipso.instanceID, ipso.resourceID), err.message);
  }

  _internalOutputs(){
    return 'internal/+/+/+/output';
  }
}

module.exports = MQTTPublishAgent;
