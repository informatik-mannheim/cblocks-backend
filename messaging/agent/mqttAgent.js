class MQTTAgent{
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
    let that = this;
    let ipso = this.util.decomposeResourceTopic(topic);

    (async function(){
      let data = JSON.parse(message);

      let p = await that.resourcePublisherUseCase.publish(ipso.objectID, ipso.instanceID, ipso.resourceID, data);
      return p;
    })().catch(this._onPublishError.bind(this, ipso))
  }

  _onPublishError(ipso, err){
    this.client.publish(this.util.getPublishErrorTopic(ipso.objectID, ipso.instanceID, ipso.resourceID), err.message);
  }

  _internalOutputs(){
    return 'internal/+/+/+/output';
  }
}

module.exports = MQTTAgent;
