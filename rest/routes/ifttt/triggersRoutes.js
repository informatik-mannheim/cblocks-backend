class Routes {
  constructor(hapiServer, controller, validateHeaders) {
    this.hapiServer = hapiServer;
    this.controller = controller;
    this.validateHeaders = validateHeaders;
  }

  start() {
    this.hapiServer.route({
      'method': 'POST',
      'path': '/ifttt/v1/triggers/new_sensor_data',
      'handler': this.controller.postNewSensorData.bind(this.controller),
      'options': {
        'validate': {
          'headers': this.validateHeaders,
        },
      },
    });
  }
}

module.exports = Routes;
