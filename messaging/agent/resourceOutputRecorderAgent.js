class ResourceOutputRecorderAgent {
  constructor(client, util, triggerUseCase) {
    this.client = client;
    this.util = util;
    this.useCase = triggerUseCase;
  }

  start() {
    this.client.subscribe('#/output');
    this.client.on('message', this._onMessage.bind(this));
  }

  async _onMessage(topic, message) {
    if (!this.util.isOutputTopic(topic)) return;

    try {
      const ipso = this.util.decomposeResourceOutputTopic(topic);

      await this.useCase.record(ipso, message);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = ResourceOutputRecorderAgent;
