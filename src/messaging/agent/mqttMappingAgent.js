class MQTTMappingAgent {
  constructor(mappingName, client, util, inputUseCase, outputUseCase, triggersUseCase) {
    this._mappingName = mappingName;
    this._client = client;
    this._util = util;
    this._inputUseCase = inputUseCase;
    this._outputUseCase = outputUseCase;
    this._triggersUseCase = triggersUseCase || {
      'notify': () => {},
    };
  }

  async start() {
    this._outputUseCase.registerOnUpdateMappings(this._onUpdateMappings.bind(this));
    await this._subscribeToResources();
    await this._subscribeToInputs();
    this._client.on('message', this.onMessage.bind(this));
  }

  async _subscribeToResources() {
    const mappings = await this._outputUseCase.getMappings();

    mappings.forEach((m) =>
      this._client.subscribe(this._util.getResourceOutputTopic(
        m.objectID, m.instanceID, m.resourceID)));
  }

  async _subscribeToInputs() {
    const mappings = await this._outputUseCase.getMappings();

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
      try {
        message = JSON.parse(message);
      } catch (error) {
        message = String(message);
      }

      const v = String(await this._outputUseCase.apply(m, message));

      await this._triggersUseCase.notify();

      this._client.publish(`mappings/${this._mappingName}/${m.mappingID}/output`, v);
    });

    await Promise.all(promises);
  }

  async _getMappingsForTopic(topic) {
    const ipso = this._util.decomposeResourceOutputTopic(topic);

    return this._outputUseCase.getMappingsFor(ipso);
  }

  async _handleInput(topic, message) {
    try {
      const m = await this._getMappingForMappingInput(topic);
      this._inputUseCase.apply(m, String(message));
    } catch (e) {
      // TODO: some form of logging
    }
  }

  _getMappingForMappingInput(topic) {
    const id = this._util.getMappingIDInTopic(topic);

    return this._inputUseCase.getMapping(id);
  }

  async _onUpdateMappings() {
    this._subscribeToResources();
  }
}

module.exports = MQTTMappingAgent;
