const inputTopics = '+/+/+/+/input'

class MQTTWriteAgent{
  constructor(client, util, resourceWriteUseCase){
    this.client = client;
    this.util = util;
    this.resourceWriteUseCase = resourceWriteUseCase;
  }

  start(){
    this.client.subscribe(inputTopics)
    this.client.on('message', this._onMessage.bind(this))
  }

  _onMessage(topic, message){
    if(!this._isInputTopic(topic)) return

    //TODO decompose to ipso and delegate to usecase, if timeout write into response topic
    let ipso = this.util.decomposeResourceInputTopic(topic)
    let data = JSON.parse(message)

    this._write(ipso, data)
  }

  _write(ipso, data){
    this.resourceWriteUseCase.write(ipso.clientID, ipso.objectID, ipso.instanceID, ipso.resourceID, data)
  }

  _isInputTopic(topic){
    return topic.includes('input')
  }
}

module.exports = MQTTWriteAgent;
