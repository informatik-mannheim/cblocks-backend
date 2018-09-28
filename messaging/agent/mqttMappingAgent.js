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
        m.objectID, m.resourceID, m.instanceID)));
  }

  async _subscribeToInputs() {
    const mappings = await this._useCase.getMappings();

    mappings.forEach((m) =>
      this._client.subscribe(this._util.getMappingsInputTopic(
        m._id, this._mappingName)));
  }

  onMessage(topic, message) {
    if (this._util.isOutputTopic(topic)) this._handleOutput(topic, message);
  }

  async _handleOutput(topic, message) {
    const mappings = await this._getMappingsForTopic(topic);

    await mappings.forEach(async (m) => {
      const v = String(await this._useCase.applyMapping(m, message));

      this._client.publish(`mappings/${this._mappingName}/${m.mappingID}`, v);
    });
  }

  async _getMappingsForTopic(topic) {
    const ipso = this._util.decomposeResourceOutputTopic(topic);

    return this._useCase.getMappingsFor(ipso);
  }

  async _onUpdateMappings() {
    this._subscribeToResources();
  }
}

module.exports = MQTTMappingAgent;
