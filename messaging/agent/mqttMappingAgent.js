class MQTTMappingAgent {
  constructor(mappingName, client, util, useCase) {
    this._mappingName = mappingName;
    this._client = client;
    this._util = util;
    this._useCase = useCase;
  }

  async start() {
    this._useCase.registerOnUpdateMappings(this._onUpdateMappings.bind(this));
    await this._subscribeToResources();
    await this._subscribeToInputs();
    this._client.on('message', this.onMessage.bind(this));
  }

  async _subscribeToResources() {
    const mappings = await this._useCase.getMappings();

    mappings.forEach((m) =>
      this._client.subscribe(this._util.getResourceOutputTopic(
        m.objectID, m.instanceID, m.resourceID)));
  }

  async _subscribeToInputs() {
    const mappings = await this._useCase.getMappings();

    mappings.forEach((m) => {
      this._client.subscribe(this._util.getMappingsInputTopic(
        m.mappingID, this._mappingName));
    });
  }

  onMessage(topic, message) {
    if (this._util.isOutputTopic(topic)) {
      return this._handleOutput(topic, message);
    } else if (this._util.isMappingInputTopic(topic)) {
      return this._handleInput(topic, message);
    }
  }

  async _handleOutput(topic, message) {
    const mappings = await this._getMappingsForTopic(topic);

    const promises = mappings.map(async (m) => {
      const v = String(await this._useCase.applyMapping(m, message));

      this._client.publish(`mappings/${this._mappingName}/${m.mappingID}/output`, v);
    });

    await Promise.all(promises);
  }

  async _getMappingsForTopic(topic) {
    const ipso = this._util.decomposeResourceOutputTopic(topic);

    return this._useCase.getMappingsFor(ipso);
  }

  async _handleInput(topic, message) {
    try {
      const m = await this._getMappingForMappingInput(topic);
      let v = this._useCase.applyInputMapping(m, String(message));

      if (v instanceof Object) {
        v = JSON.stringify(v);
      } else {
        v = String(v);
      }

      this._client.publish(this._util.getInternalResourceInputTopic(
        'service', m.objectID, m.instanceID, m.resourceID), JSON.stringify({
          'data': v,
        }));
    } catch (e) {
      // TODO: some form of logging
    }
  }

  _getMappingForMappingInput(topic) {
    const id = this._util.getMappingIDInTopic(topic);

    return this._useCase.getMapping(id);
  }

  async _onUpdateMappings() {
    this._subscribeToResources();
  }
}

module.exports = MQTTMappingAgent;
