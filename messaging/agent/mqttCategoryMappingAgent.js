class MQTTCategoryMappingAgent {
  constructor(client, util, useCase) {
    this._client = client;
    this._util = util;
    this._useCase = useCase;

    this._mappings = [];
  }

  async start() {
    this._useCase.registerOnUpdateMappings(this.onUpdateMappings.bind(this));
    await this._getMappings();
    await this._subscribeToResources();
    this._client.on('message', this.onMessage.bind(this));
  }

  async _subscribeToResources() {
    for (let i = 0; i < this._mappings.length; i++) {
      const m = this._mappings[i];

      this._client.subscribe(this._util.getResourceOutputTopic(
        m.objectID, m.resourceID, m.instanceID));
    }
  }

  async _getMappings() {
    try {
      this._mappings = await this._useCase.getCategoryMappings();
    } catch (e) {
      this._mappings = [];
    }
  }

  async onMessage(topic, message) {
    const ipso = this._util.decomposeResourceOutputTopic(topic);

    // TODO: test
    const relevantMappings = this._mappings.filter((m) =>
      m.objectID === ipso.objectID &&
      m.resourceID === ipso.resourceID &&
      m.instanceID === ipso.instanceID);

    for (let i = 0; i < relevantMappings.length; i++) {
      const m = relevantMappings[i];

      const v = await this._useCase.applyMapping(
        m.mappingID, parseInt(message, 10));

      this._client.publish(`mappings/${m.mappingID}`, v);
    }
  }

  async onUpdateMappings() {
    await this._getMappings();
    await this._subscribeToResources();
  }
}

module.exports = MQTTCategoryMappingAgent;
