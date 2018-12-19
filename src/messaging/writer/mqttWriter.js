const Deferred = require('promise-defer');

const responseTopic = '+/responses';

class MQTTWriter {
  constructor(client, util, writeTimeoutMS) {
    this.client = client;
    this.util = util;
    this.writeTimeoutMS = writeTimeoutMS;
    this.pendingWrites = {};

    this._subscribeToResponses();
  }

  _subscribeToResponses() {
    this.client.on('message', this._onMessage.bind(this));
    this.client.subscribe(responseTopic);
  }

  _onMessage(topic, message) {
    if (this.util.isResponseTopic(topic)) {
      const data = JSON.parse(message);
      const clientID = this.util.getClientIDInResponseTopic(topic);

      this._resolvePending(clientID, data.requestID);
    }
  }

  _resolvePending(clientID, requestID) {
    if (this._isInPendingWrites(clientID, requestID)) {
      this.pendingWrites[clientID][requestID].resolve();
      delete this.pendingWrites[clientID][requestID];
    }
  }

  _isInPendingWrites(clientID, requestID) {
    if (this.pendingWrites.hasOwnProperty(clientID)) {
      if (this.pendingWrites[clientID].hasOwnProperty(requestID)) {
        return true;
      }
    }

    return false;
  }

  writeResourceValue(clientID, objectID, instanceID, resourceID, data) {
    const deferred = new Deferred();
    deferred.promise.deferred = deferred; // TODO super ugly for testability

    const f = () => {
      this._publishInternally(clientID, objectID, instanceID, resourceID, data);

      if (!this._hasRequestID(data)) {
        return deferred.resolve();
      }

      this._addToPendingWrites(deferred, clientID, data.requestID);

      this._setWriteTimeout(clientID, data.requestID);
    };

    f();

    return deferred.promise;
  }

  _publishInternally(clientID, objectID, instanceID, resourceID, data) {
    this.client.publish(
      this.util.getInternalResourceInputTopic(
        clientID, objectID, instanceID, resourceID),
      JSON.stringify(data)
    );
  }

  _hasRequestID(data) {
    return data.hasOwnProperty('requestID');
  }

  _addToPendingWrites(deferred, clientID, requestID) {
    if (!this.pendingWrites.hasOwnProperty(clientID)) {
      this.pendingWrites[clientID] = {};
    }

    this.pendingWrites[clientID][requestID] = deferred;
  }

  _setWriteTimeout(clientID, requestID) {
    setTimeout(() => {
      this._rejectPending(clientID, requestID, 'Timeout.');
    }, this.writeTimeoutMS);
  }

  _rejectPending(clientID, requestID, reason) {
    if (this._isInPendingWrites(clientID, requestID)) {
      this.pendingWrites[clientID][requestID].reject(new Error(reason));
      delete this.pendingWrites[clientID][requestID];
    }
  }
}

module.exports = MQTTWriter;
