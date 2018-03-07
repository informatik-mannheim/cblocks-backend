class MQTTAgent{
  constructor(client, util, resourcePublisherUseCase){
    this.client = client;
    this.util = util;
    this.resourcePublisherUseCase = resourcePublisherUseCase;
  }

  start() {
    this.client.subscribe(this._internalOutputs());
    this.client.on('message', this._onMessage);
  }

  _onMessage(topic, message){

  }

  _internalOutputs(){
    return 'internal/+/+/+/output';
  }
}

module.exports = MQTTAgent;
