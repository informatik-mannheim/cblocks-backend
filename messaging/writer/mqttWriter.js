let Deferred = require('promise-defer')

const responseTopic = '+/responses'
const writeTimeoutMS = 2000;

class MQTTWriter{
  constructor(client, util){
    this.client = client;
    this.util = util;
    this.pendingWrites = {};

    this._subscribeToResponses()
  }

  _subscribeToResponses(){
    this.client.on('message', this._onMessage.bind(this))
    this.client.subscribe(responseTopic);
  }

  _onMessage(topic, message){
    let data = JSON.parse(message)
    let clientID = this.util.getClientIDInResponseTopic(topic);

    if(this._isInPendingWrites(clientID, data.requestID)){
      this._resolvePending(clientID, data.requestID)
    }
  }

  _resolvePending(clientID, requestID){
    this.pendingWrites[clientID][requestID].resolve()
    delete this.pendingWrites[clientID][requestID]
  }

  _isInPendingWrites(clientID, requestID){
    if(this.pendingWrites.hasOwnProperty(clientID)){
      if(this.pendingWrites[clientID].hasOwnProperty(requestID)){
        return true;
      }
    }

    return false;
  }

  writeResourceValue(clientID, objectID, instanceID, resourceID, data){
    let deferred = new Deferred()
    deferred.promise.deferred = deferred //TODO super ugly for testability

    let f = () => {
      this.client.publish(this.util.getResourceInputTopic(clientID, objectID, instanceID, resourceID), JSON.stringify(data.data))

      if(!this._hasRequestID(data))
        return deferred.resolve()

      this._addToPendingWrites(deferred, clientID, data.requestID)

      setTimeout(this._timeout.bind(this, clientID, data.requestID), writeTimeoutMS);
    }

    f()

    return deferred.promise
  }

  _hasRequestID(data){
    return data.hasOwnProperty("requestID");
  }

  _addToPendingWrites(deferred, clientID, requestID){
    if(!this.pendingWrites.hasOwnProperty(clientID))
      this.pendingWrites[clientID] = {}

    this.pendingWrites[clientID][requestID] = deferred
  }

  _timeout(clientID, requestID){
    if(this._isInPendingWrites(clientID, requestID)){
      this._rejectPending(clientID, requestID, "Timeout.")
    }
  }

  _rejectPending(clientID, requestID, reason){
    this.pendingWrites[clientID][requestID].reject(new Error(reason))
    delete this.pendingWrites[clientID][requestID]
  }
}

module.exports = MQTTWriter;
