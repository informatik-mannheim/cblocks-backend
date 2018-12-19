class Controller {
  constructor(request) {
    this.request = request;
  }

  async notify(triggerIdentities) {
    try {
      if (!triggerIdentities.length) return;

      const data = triggerIdentities
        .map((triggerIdentity) => ({
          'trigger_identity': triggerIdentity,
        }));

      await this.request
        .post(
          'https://realtime.ifttt.com/v1/notifications', {data}
        );
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = Controller;
