class ResourceOutputRecorderAgent {
  constructor(client, util, recordUseCase, triggersUseCase) {
    this.client = client;
    this.util = util;
    this.recordUseCase = recordUseCase;
    this.triggersUseCase = triggersUseCase;
  }

  start() {
    this.client.subscribe('+/+/+/output');
    this.client.on('message', this._onMessage.bind(this));
  }

  async _onMessage(topic, message) {
    if (!this.util.isOutputTopic(topic)) return;

    try {
      const ipso = this.util.decomposeResourceOutputTopic(topic);

      await this.recordUseCase.record(ipso, JSON.parse(message));
      await this.triggersUseCase.notify();
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = ResourceOutputRecorderAgent;
