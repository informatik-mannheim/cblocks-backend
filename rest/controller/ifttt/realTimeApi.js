class Controller {
  constructor(request) {
    this.request = request;
  }

  async notifyNewSensorData() {
    const response = await this.request.post('https://realtime.ifttt.com/v1/notifications', {
      'data': [{
        'trigger_identity': '4912a5a3111843b3a84add5900146ab428945960',
      }],
    });
  }
}

module.exports = Controller;
