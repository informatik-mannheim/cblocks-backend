class Controller {
  constructor(request) {
    this.request = request;
  }

  async notify(triggerIdentities) { // TODO: test it
    const data = triggerIdentities
      .map((triggerIdentity) => ({
        'trigger_identity': triggerIdentity,
      }));

    await this.request
      .post(
        'https://realtime.ifttt.com/v1/notifications', {data}
      );
  }
}

module.exports = Controller;
