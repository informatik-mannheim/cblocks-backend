class MQTTMappingAgent {
  constructor(client, util, useCase) {
    this._client = client;
    this._util = util;
    this._useCase = useCase;
  }

  async start() {
    this._useCase.registerOnUpdateMappings(this._onUpdateMappings.bind(this));
    await this._subscribeToResources();
    this._client.on('message', this.onMessage.bind(this));
  }

  async _subscribeToResources() {
    const mappings = await this._useCase.getMappings();

    for (let i = 0; i < mappings.length; i++) {
      const m = mappings[i];

      this._client.subscribe(this._util.getResourceOutputTopic(
        m.objectID, m.resourceID, m.instanceID));
    }
  }

  async onMessage(topic, message) {
    if (!this._util.isOutputTopic(topic)) return;

    const mappings = await this._getMappingsForTopic(topic);

    for (let i = 0; i < mappings.length; i++) {
      const m = mappings[i];

      const v = String(await this._useCase.applyMapping(m, message));

      this._client.publish(`mappings/${m.mappingID}`, v);
    }
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
