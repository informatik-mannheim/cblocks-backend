class MQTTMappingAgent {
  constructor(client, util, useCase) {
    this._client = client;
    this._util = util;
    this._useCase = useCase;

    this._mappings = [];
  }

  async start() {
    this._useCase.registerOnUpdateMappings(this.onUpdateMappings.bind(this));
    await this._getMappings();
    this._subscribeToResources();
    this._client.on('message', this.onMessage.bind(this));
  }

  _subscribeToResources() {
    for (let i = 0; i < this._mappings.length; i++) {
      const m = this._mappings[i];

      this._client.subscribe(this._util.getResourceOutputTopic(
        m.objectID, m.resourceID, m.instanceID));
    }
  }

  async _getMappings() {
    try {
      this._mappings = await this._useCase.getMappings();
    } catch (e) {
      this._mappings = [];
    }
  }

  async onMessage(topic, message) {
    const mappings = this._getMappingsForTopic(topic);

    for (let i = 0; i < mappings.length; i++) {
      const m = mappings[i];

      const v = String(await this._useCase.applyMapping(m, message));

      this._client.publish(`mappings/${m.mappingID}`, v); // TODO: await all publishes
    }
  }

  _getMappingsForTopic(topic) {
    const ipso = this._util.decomposeResourceOutputTopic(topic);

    return this._filterMappingsByIpso(this._mappings, ipso);
  }

  _filterMappingsByIpso(mappings, ipso) { // TODO: Feature envy: give array a function to filter by ipso
    return mappings.filter((m) =>
      m.objectID === ipso.objectID &&
      m.resourceID === ipso.resourceID &&
      m.instanceID === ipso.instanceID);
  }

  async onUpdateMappings() {
    await this._getMappings();
    this._subscribeToResources();
  }
}

module.exports = MQTTMappingAgent;
