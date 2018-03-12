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

    let ipso = this.util.decomposeResourceInputTopic(topic)
    let data = JSON.parse(message)

    this._write(ipso, data)
  }

  _isInputTopic(topic){
    return topic.includes('input')
  }

  _write(ipso, data){
    this.resourceWriteUseCase.write(ipso.clientID, ipso.objectID, ipso.instanceID, ipso.resourceID, data)
      .catch(this._onWriteError.bind(this, ipso.clientID, data.requestID))
  }

  _onWriteError(clientID, requestID, err){
    if(requestID) {
      this.client.publish(this.util.getWriteResponseTopic(clientID), JSON.stringify({
        'requestID': requestID,
        'success': false,
        'message': err.message
      }))
    }
  }
}

module.exports = MQTTWriteAgent;
