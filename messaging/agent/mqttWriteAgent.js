const inputTopics = '+/+/+/+/input';
const ResourceWriteError =
  require('../../use-cases/resource-write/resourceWriteError.js');

class MQTTWriteAgent {
  constructor(client, util, resourceWriteUseCase) {
    this.client = client;
    this.util = util;
    this.resourceWriteUseCase = resourceWriteUseCase;
  }

  start() {
    this.client.subscribe(inputTopics);
    this.client.on('message', this._onMessage.bind(this));
  }

  async _onMessage(topic, message) {
    if (!this._isInputTopic(topic)) return;

    let ipso;
    let data;

    try {
      ipso = this.util.decomposeResourceInputTopic(topic);
      data = JSON.parse(message);

      await this._write(ipso, data);
    } catch (e) {
      if (typeof e !== ResourceWriteError) {
        this._onWriteError(ipso.clientID, data.requestID, e);
      } else {
        console.log(e.message);
      }
    }
  }

  _isInputTopic(topic) {
    return topic.includes('input');
  }

  _write(ipso, data) {
    return this.resourceWriteUseCase.write(
      ipso.clientID, ipso.objectID, ipso.instanceID, ipso.resourceID, data);
  }

  _onWriteError(clientID, requestID, err) {
    if (requestID) {
      this._publishError(clientID, requestID, err.message);
    }
  }

  _publishError(clientID, requestID, errorMessage) {
    this.client.publish(
      this.util.getWriteResponseTopic(clientID), JSON.stringify({
        'requestID': requestID,
        'success': false,
        'message': errorMessage,
    }));
  }
}

module.exports = MQTTWriteAgent;
